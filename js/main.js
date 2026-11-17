import * as THREE from 'three';
import RAPIER from 'rapier';
import { createDeskMesh, updateBlackboardDisplay } from './desk.js?v=sv1998_pbr_v2';
import { PEN_CONFIGS, createPenMesh } from './pens.js?v=pbr_restitution_048';
import { synth } from './sound.js';
import { ProgressionEngine, CAMPAIGN_STAGES, BADGES, LEVELS } from './progression.js?v=p2_s4';
import { storage } from './storage.js?v=p2_s5';
import { MatchRules, MatchState } from './rules.js?v=p3_s17_alt_turns';
import { PCOpponentController } from './bot.js?v=p3_s20_friction060';

// Table dimensions (meters) - Vertical Student Duel Desk (0.70m x 1.00m)
const DESK_WIDTH = 0.70;      // 70 cm width (X-axis, East-West)
const DESK_LENGTH = 1.00;     // 100 cm length (Z-axis, North-South, Vertical)
const DESK_THICKNESS = 0.030; // 3 cm thickness

// Authentic baseline physics
const GRAVITY = -9.81;
const DESK_FRICTION = 0.60; // High 60% grip (strong braking, tactile grounded resistance)
const DESK_RESTITUTION = 0.10;
const PEN_LINEAR_DAMPING = 0.65; // Grounded teak wood drag (stops free-floating slip)
const PEN_ANGULAR_DAMPING = 0.80;
const PEN_RESTITUTION = 0.48; // Realistic rigid plastic collision (solid momentum transfer, prevents 1-hit center blast)
const PEN_FRICTION = 0.30;

// Tactical Spawn Positions (Z = ±0.40m, 80cm runway, 10cm border buffer)
const SPAWN_Z_PLAYER = 0.40;
const SPAWN_Z_OPPONENT = -0.40;

// Dynamic Random Offset: (Math.random() - 0.5) * DESK_WIDTH * 0.22 (3 to 7 cm natural slight angle)
function getRandomSpawnOffsetX() {
  return (Math.random() - 0.5) * DESK_WIDTH * 0.22;
}

// Input & flick parameters (Calibrated mass-velocity impulse scaling)
const DEAD_ZONE_PX = 10;
const V_MIN = 0.35; // m/s (tactical micro-positioning)
const V_MAX = 2.15; // m/s (calibrated realistic speed; full 100% pull reaches edge without rocket launch)
const J_MIN = 0.0030;
const J_MAX = 0.042; // Calibrated 100% impulse for 0.60 desk friction
const GAMMA = 1.42; // Progressive response: 65-75% drag = safe positioning, 100% drag = overshoot foul risk
const MAX_DRAG_PX = 115; // Natural ergonomic mobile touch drag distance

// Settle thresholds
const SETTLE_LIN_VEL = 0.015;
const SETTLE_ANG_VEL = 0.15;

class GameEngine {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.world = null;

    // Entities
    this.playerPen = null;
    this.opponentPen = null;
    this.deskMesh = null;

    // Flick Interaction State
    this.isDragging = false;
    this.activeFlickZone = 'cap';
    this.flickAnchorPoint = new THREE.Vector3();
    this.dragStart = new THREE.Vector2();
    this.dragCurrent = new THREE.Vector2();
    this.smoothedDrag = new THREE.Vector2();
    this.isSimulating = false;
    this.stableStartTime = 0;

    // Phase 2 Step 2.5: Offline LocalStorage Persistence & Hydration
    this.storage = storage;
    const savedState = this.storage.load();

    // Hydrate progression engine from persistent storage
    this.progression = new ProgressionEngine(savedState.progression);

    // Hydrate pen configs
    this.playerPenConfigKey = savedState.profile.selectedPlayerPen || 'reynolds045';
    this.opponentPenConfigKey = savedState.profile.selectedOpponentPen || 'trimax';

    // Hydrate game mode & difficulty
    const initialMode = savedState.settings.mode || 'bot';
    const initialDiff = savedState.settings.difficulty || 'normal';

    // Phase 2 Step 2.2: Mathematical Bot AI Controller
    this.botAI = new PCOpponentController({ difficulty: initialDiff, thinkTimeMs: 800, deskFriction: DESK_FRICTION });

    // Phase 2 Step 2.1: Match Loop & Turn State Machine
    this.rules = new MatchRules({
      targetWins: 3, // Best of 5 (First to 3 wins)
      mode: initialMode,
      onScoreUpdate: (pScore, oScore, round) => {
        if (window.hudController && !this.rules.matchOver) {
          window.hudController.updateScore(pScore, oScore, this.rules.targetWins || 3);
        }
      }
    });
    this.rules.startMatch(initialMode);

    // Phase 1 Pure Physics Sandbox State
    this.collisionSoundCooldown = false;
    this.currentStageId = (savedState.progression && savedState.progression.currentStageId) || 1;
    this.playerUsedSpin = false;

    // 3D Raycasting
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.aimArrow = null;

    // 120 Hz Fixed Timestep Accumulator & Interpolation State
    this.lastTime = 0;
    this.accumulator = 0;
    this.fixedTimeStep = 1 / 120;
  }

  async init() {
    // 1. Initialize Rapier WASM (120 Hz deterministic physics)
    await RAPIER.init();
    const gravity = new RAPIER.Vector3(0.0, GRAVITY, 0.0);
    this.world = new RAPIER.World(gravity);
    this.world.timestep = 1 / 120;

    // 2. Setup Three.js Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xd8ceb4); // Warm classroom lime-plaster cream
    this.scene.fog = new THREE.FogExp2(0xe4dac2, 0.045); // Atmospheric classroom depth

    // Warm sunlit ambient bounce
    const ambientLight = new THREE.AmbientLight(0xfff3dc, 1.25);
    this.scene.add(ambientLight);

    // Warm fill hemisphere light (preserves rich shadow side detail on pens)
    const hemiLight = new THREE.HemisphereLight(0xfff8eb, 0x6e583f, 0.40);
    this.scene.add(hemiLight);

    // Warm afternoon sunlight streaming from left classroom window
    const deskLight = new THREE.DirectionalLight(0xfff1d6, 2.60);
    deskLight.position.set(-1.6, 2.2, 0.2);
    deskLight.castShadow = true;
    deskLight.shadow.mapSize.width = 2048;
    deskLight.shadow.mapSize.height = 2048;
    deskLight.shadow.camera.near = 0.5;
    deskLight.shadow.camera.far = 5;
    deskLight.shadow.camera.left = -1.5;
    deskLight.shadow.camera.right = 1.5;
    deskLight.shadow.camera.top = 2.0;
    deskLight.shadow.camera.bottom = -2.0;
    deskLight.shadow.bias = -0.0004;
    this.scene.add(deskLight);

    // 3. Perspective Camera (Exact penfight.xyz elevated framing)
    this.camera = new THREE.PerspectiveCamera(54, window.innerWidth / window.innerHeight, 0.05, 20);
    this.updateCameraView();

    // 4. WebGL Renderer with High DPR + MSAA + ACES Filmic Tone Mapping
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.container.appendChild(this.renderer.domElement);

    // 5. Central Desk & Classroom Environment
    this.deskMesh = createDeskMesh(DESK_WIDTH, DESK_LENGTH, DESK_THICKNESS);
    this.scene.add(this.deskMesh);

    // Rapier desk collider
    const deskBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(0, -DESK_THICKNESS / 2, 0);
    const deskBody = this.world.createRigidBody(deskBodyDesc);
    const deskColliderDesc = RAPIER.ColliderDesc.cuboid(DESK_WIDTH / 2, DESK_THICKNESS / 2, DESK_LENGTH / 2)
      .setFriction(DESK_FRICTION)
      .setRestitution(DESK_RESTITUTION);
    this.world.createCollider(deskColliderDesc, deskBody);

    // 6. Spawn 2 Pens FLAT HORIZONTALLY (East-West widthwise across desk, ~70cm runway)
    // 6. Spawn 2 Pens FLAT HORIZONTALLY (East-West widthwise across desk, ~70cm runway)
    const pConfig = PEN_CONFIGS[this.playerPenConfigKey] || PEN_CONFIGS.reynolds045;
    const oConfig = PEN_CONFIGS[this.opponentPenConfigKey] || PEN_CONFIGS.trimax;

    this.playerPen = this.spawnPen(
      pConfig, 
      new THREE.Vector3(getRandomSpawnOffsetX(), pConfig.radius, SPAWN_Z_PLAYER), 
      Math.PI / 2
    );

    this.opponentPen = this.spawnPen(
      oConfig, 
      new THREE.Vector3(getRandomSpawnOffsetX(), oConfig.radius, SPAWN_Z_OPPONENT), 
      Math.PI / 2
    );

    // 7. Aim Arrow Helper
    const dir = new THREE.Vector3(0, 0, -1);
    this.aimArrow = new THREE.ArrowHelper(dir, new THREE.Vector3(0, 0, 0), 0.1, 0xf2c75c, 0.04, 0.03);
    this.aimArrow.visible = false;
    this.scene.add(this.aimArrow);

    // 8. Event Listeners & Natural Touch Controls
    window.addEventListener('resize', () => this.onWindowResize());
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyR') {
        this.resetRound();
      }
    });
    this.setupNaturalTouchControls();

    // Sync UI controls with persistent storage state
    this.syncUIWithStorage();

    // Start 120 Hz render loop
    this.animate();
  }

  updateCameraView() {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera.aspect = aspect;

    if (aspect >= 1.2) {
      // Landscape (PC / Laptop - exact penfight.xyz framing)
      this.camera.fov = 55;
      this.camera.position.set(0, 0.90, 1.05);
      this.camera.lookAt(0, 0.08, -0.16);
    } else if (aspect <= 0.75) {
      // Portrait (Mobile)
      this.camera.fov = 66;
      this.camera.position.set(0, 1.05, 0.94);
      this.camera.lookAt(0, 0.10, -0.18);
    } else {
      // Tablet / Medium
      this.camera.fov = 60;
      this.camera.position.set(0, 0.95, 1.02);
      this.camera.lookAt(0, 0.08, -0.18);
    }
    this.camera.updateProjectionMatrix();
  }

  syncUIWithStorage() {
    // Internal state synced with persistent local storage
  }

  setDifficulty(mode) {
    if (!['easy', 'normal', 'hard'].includes(mode)) return;
    this.difficulty = mode;
    this.botAI.setDifficulty(mode);
    this.storage.save({ settings: { difficulty: mode } });
  }

  setGameMode(mode) {
    if (!['bot', 'pass_and_play'].includes(mode)) return;
    this.rules.startMatch(mode);
    this.storage.save({ settings: { mode: mode } });

    updateBlackboardDisplay(mode === 'pass_and_play' ? "PASS & PLAY (2P)" : "VS BOT DUEL");
    setTimeout(() => updateBlackboardDisplay(null), 1500);

    this.resetRound();
    this.updateTurnBadge();
  }

  spawnPen(config, pos, rotY) {
    const mesh = createPenMesh(config);
    this.scene.add(mesh);

    const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(pos.x, pos.y, pos.z)
      .setLinearDamping(config.linearDamping || PEN_LINEAR_DAMPING)
      .setAngularDamping(config.angularDamping || PEN_ANGULAR_DAMPING)
      .setCcdEnabled(true);

    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
    bodyDesc.setRotation({ x: q.x, y: q.y, z: q.z, w: q.w });

    const body = this.world.createRigidBody(bodyDesc);

    const halfLen = config.length / 2;
    const colliderDesc = RAPIER.ColliderDesc.cuboid(config.radius, config.radius, halfLen)
      .setMass(config.mass)
      .setFriction(DESK_FRICTION * (config.friction ? (config.friction / 0.35) : 1.0))
      .setRestitution(PEN_RESTITUTION); // 0.48 Balanced Deflection Elasticity (realistic glancing hits, no rocket launch)

    this.world.createCollider(colliderDesc, body);

    const pPos = new THREE.Vector3(pos.x, pos.y, pos.z);
    return {
      config,
      mesh,
      body,
      isFallen: false,
      initialPos: pos.clone(),
      initialRotY: rotY,
      prevPos: pPos.clone(),
      prevQuat: q.clone(),
      currPos: pPos.clone(),
      currQuat: q.clone()
    };
  }

  setupNaturalTouchControls() {
    const getIntersectionPoint = (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const deskPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const target = new THREE.Vector3();
      this.raycaster.ray.intersectPlane(deskPlane, target);
      return target;
    };

    const onPointerDown = (e) => {
      if (this.isSimulating) return;
      if (window.hudController && typeof window.hudController.isPaused === 'function' && window.hudController.isPaused()) return;

      // Strict Turn & Input Lock: Determine active side ('player' or 'opponent')
      const activeSide = this.rules.activeTurn;
      if (!this.rules.isInteractionAllowed(activeSide)) return;

      const hit = getIntersectionPoint(e);
      if (!hit) return;

      const activePen = activeSide === 'player' ? this.playerPen : this.opponentPen;
      if (!activePen || !activePen.body || activePen.isFallen) return;

      const pPos = activePen.body.translation();
      const pRot = activePen.body.rotation();
      const penQuat = new THREE.Quaternion(pRot.x, pRot.y, pRot.z, pRot.w);
      const halfLen = activePen.config.length / 2;

      // Real 3D endpoints in world space
      const capLocal = new THREE.Vector3(0, 0, halfLen * 0.85).applyQuaternion(penQuat);
      const nibLocal = new THREE.Vector3(0, 0, -halfLen * 0.85).applyQuaternion(penQuat);

      const capWorld = new THREE.Vector3(pPos.x, pPos.y, pPos.z).add(capLocal);
      const nibWorld = new THREE.Vector3(pPos.x, pPos.y, pPos.z).add(nibLocal);

      const distToCap = hit.distanceTo(capWorld);
      const distToNib = hit.distanceTo(nibWorld);

      // Strict proximity check: Must touch the ACTIVE player's pen endpoint
      if (Math.min(distToCap, distToNib) > 0.35) {
        return; // Touched away from active pen (or touched wrong player's pen)
      }

      this.activeFlickSide = activeSide;
      if (distToCap <= distToNib) {
        this.activeFlickZone = 'cap';
        this.flickAnchorPoint.copy(capWorld);
      } else {
        this.activeFlickZone = 'nib';
        this.flickAnchorPoint.copy(nibWorld);
      }

      this.isDragging = true;
      this.dragStart.set(e.clientX, e.clientY);
      this.dragCurrent.set(e.clientX, e.clientY);
      this.smoothedDrag.set(e.clientX, e.clientY);

      this.aimArrow.position.set(this.flickAnchorPoint.x, 0.015, this.flickAnchorPoint.z);
      this.aimArrow.visible = true;

    };

    const onPointerMove = (e) => {
      if (!this.isDragging) return;
      this.dragCurrent.set(e.clientX, e.clientY);
      this.smoothedDrag.lerp(this.dragCurrent, 0.75);

      const pxDiffX = this.smoothedDrag.x - this.dragStart.x;
      const pxDiffY = this.smoothedDrag.y - this.dragStart.y;
      const dragPx = Math.hypot(pxDiffX, pxDiffY);

      if (dragPx < DEAD_ZONE_PX) {
        if (window.hudController) {
          window.hudController.updatePower(0);
        }
        return;
      }

      const maxPullPx = MAX_DRAG_PX;
      const pullFrac = Math.min(Math.max(0, dragPx - DEAD_ZONE_PX) / maxPullPx, 1.0);
      const curvedPower = Math.pow(pullFrac, GAMMA);

      if (window.hudController) {
        window.hudController.updatePower(curvedPower * 100);
      }

      const aimDir = new THREE.Vector3(-pxDiffX, 0, -pxDiffY).normalize();
      this.aimArrow.setDirection(aimDir);
      this.aimArrow.setLength(Math.min(curvedPower * 0.28, 0.28));
    };

    const onPointerUp = () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.aimArrow.visible = false;
      if (window.hudController) {
        window.hudController.updatePower(0);
      }

      const pxDiffX = this.smoothedDrag.x - this.dragStart.x;
      const pxDiffY = this.smoothedDrag.y - this.dragStart.y;
      const dragPx = Math.hypot(pxDiffX, pxDiffY);

      if (dragPx >= DEAD_ZONE_PX) {
        this.executeFlick(this.activeFlickSide || 'player', -pxDiffX, -pxDiffY, dragPx);
      }
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    if (window.hudController && !this._hudBound) {
      this._hudBound = true;
      window.hudController.on('restart', () => {
        this.resetSandbox();
        if (window.hudController) {
          window.hudController.updateScore(0, 0, 3);
          window.hudController.setTurn('P1');
        }
      });
      window.hudController.on('quit', () => {
        if (window.hudController) window.hudController.hide();
        if (window.showMainMenu) window.showMainMenu();
      });
      window.hudController.on('flick', () => {
        if (!this.isDragging && this.rules.activeTurn === 'player' && !this.isSimulating) {
          this.executeFlick('player', 0, -1, 140);
        }
      });
      window.hudController.on('timeUp', (data) => {
        this.handleTimeUp(data);
      });
    }
  }

  // Anti-Instant-KO: Opening Break Shot Grip on defending pen (Turn 1 only)
  applyOpeningBreakGrip(defendingPen) {
    if (this.roundTurnCount === 1 && defendingPen && defendingPen.body) {
      defendingPen.body.setLinearDamping(3.2);
      if (typeof defendingPen.body.collider === 'function' && defendingPen.body.collider(0)) {
        defendingPen.body.collider(0).setFriction(0.85);
      }
      defendingPen.customFriction = 0.85;
      this.hasAppliedTurn1Grip = true;
    }
  }

  restoreNormalGrip() {
    for (const pen of [this.playerPen, this.opponentPen]) {
      if (pen && pen.body) {
        pen.body.setLinearDamping(pen.config.linearDamping || PEN_LINEAR_DAMPING);
        if (typeof pen.body.collider === 'function' && pen.body.collider(0)) {
          const normalFric = DESK_FRICTION * (pen.config.friction ? (pen.config.friction / 0.35) : 1.0);
          pen.body.collider(0).setFriction(normalFric);
        }
        delete pen.customFriction;
      }
    }
    this.hasAppliedTurn1Grip = false;
  }

  executeFlick(side, dirX, dirZ, dragPx) {
    this.isSimulating = true;
    this.simStartTime = performance.now();
    this.stableStartTime = 0;
    this.roundTurnCount = (this.roundTurnCount || 0) + 1;

    // Apply Opening Break Grip to target pen on Turn 1
    const defendingPen = side === 'player' ? this.opponentPen : this.playerPen;
    this.applyOpeningBreakGrip(defendingPen);

    this.rules.onFlickExecuted(side);
    this.updateTurnBadge();
    synth.playFlick();

    const targetPen = side === 'player' ? this.playerPen : this.opponentPen;
    const penMass = (targetPen && targetPen.config && targetPen.config.mass) ? targetPen.config.mass : 0.012;

    const maxPullPx = MAX_DRAG_PX;
    const pullFrac = Math.min(Math.max(0, dragPx - DEAD_ZONE_PX) / maxPullPx, 1.0);
    const curvedPower = Math.pow(pullFrac, GAMMA);

    // Mass-normalized impulse scaling:
    // Controlled 65-75% power positions safely on 1.00m desk; full 100% blind rush (J_MAX: 0.066) risks overshooting off desk
    const massScale = penMass / 0.0122;
    const impulseMag = massScale * (J_MIN + curvedPower * (J_MAX - J_MIN));

    const dirWorld = new THREE.Vector3(dirX, 0, dirZ).normalize();
    const impulse = new RAPIER.Vector3(
      dirWorld.x * impulseMag,
      0.0,
      dirWorld.z * impulseMag
    );
    const flickPt = new RAPIER.Vector3(
      this.flickAnchorPoint.x,
      this.flickAnchorPoint.y,
      this.flickAnchorPoint.z
    );

    targetPen.body.applyImpulseAtPoint(impulse, flickPt, true);

    if (side === 'player' && targetPen && targetPen.mesh) {
      const offsetDist = Math.hypot(this.flickAnchorPoint.x - targetPen.mesh.position.x, this.flickAnchorPoint.z - targetPen.mesh.position.z);
      if (offsetDist > 0.015) {
        this.playerUsedSpin = true;
      }
    }
  }

  executeBotFlick() {
    if (this.isSimulating || this.rules.matchOver || !this.opponentPen || this.opponentPen.isFallen) return;

    this.botAI.scheduleTurn(this, () => {
      this.isSimulating = true;
      this.simStartTime = performance.now();
      this.stableStartTime = 0;
      this.roundTurnCount = (this.roundTurnCount || 0) + 1;
      this.applyOpeningBreakGrip(this.playerPen);
      this.rules.onFlickExecuted('opponent');
      this.updateTurnBadge();
      synth.playFlick();
    });
  }

  checkPhysicsSettled() {
    if (!this.isSimulating) return;

    const pLin = this.playerPen.body.linvel();
    const pAng = this.playerPen.body.angvel();
    const oLin = this.opponentPen.body.linvel();
    const oAng = this.opponentPen.body.angvel();

    const pSpeed = Math.hypot(pLin.x, pLin.y, pLin.z);
    const pRotSpeed = Math.hypot(pAng.x, pAng.y, pAng.z);
    const oSpeed = Math.hypot(oLin.x, oLin.y, oLin.z);
    const oRotSpeed = Math.hypot(oAng.x, oAng.y, oAng.z);

    const pPos = this.playerPen.body.translation();
    const oPos = this.opponentPen.body.translation();

    // 1.10m desk length out-of-bounds check
    const isOutOfBounds = (pos) => (
      pos.y < -0.02 || 
      Math.abs(pos.x) > (DESK_WIDTH / 2 + 0.02) || 
      Math.abs(pos.z) > (DESK_LENGTH / 2 + 0.02)
    );

    if (!this.playerPen.isFallen && isOutOfBounds(pPos)) {
      this.playerPen.isFallen = true;
      synth.playThud();
      this.playerPen.body.setLinvel(new RAPIER.Vector3(0, -1.5, 0), true);
      this.playerPen.body.setAngvel(new RAPIER.Vector3(0, 0, 0), true);
    }

    if (!this.opponentPen.isFallen && isOutOfBounds(oPos)) {
      this.opponentPen.isFallen = true;
      synth.playThud();
      this.opponentPen.body.setLinvel(new RAPIER.Vector3(0, -1.5, 0), true);
      this.opponentPen.body.setAngvel(new RAPIER.Vector3(0, 0, 0), true);
    }

    // A fallen pen is already eliminated — only the remaining pen on the desk needs to settle!
    const pRest = this.playerPen.isFallen || (pSpeed < SETTLE_LIN_VEL && pRotSpeed < SETTLE_ANG_VEL);
    const oRest = this.opponentPen.isFallen || (oSpeed < SETTLE_LIN_VEL && oRotSpeed < SETTLE_ANG_VEL);
    const isAtRest = pRest && oRest;

    // Safety timeout: max 3.5s simulation
    if (!this.simStartTime) this.simStartTime = performance.now();
    const isTimedOut = (performance.now() - this.simStartTime) > 3500;

    if (isAtRest || isTimedOut) {
      this.rules.onSettlingStarted();
      if (!this.stableStartTime && !isTimedOut) {
        this.stableStartTime = performance.now();
      } else if (isTimedOut || performance.now() - this.stableStartTime >= 250) {
        this.stableStartTime = 0;
        this.simStartTime = 0;
        this.isSimulating = false;
        this.resolveTurnOutcome();
      }
    } else {
      this.stableStartTime = 0;
    }
  }

  resolveTurnOutcome() {
    this.restoreNormalGrip();
    const outcome = this.rules.evaluateTurnOutcome(this.playerPen.isFallen, this.opponentPen.isFallen);
    const is2P = this.rules.mode === 'pass_and_play';
    const p1Label = is2P ? "P1" : "PLAYER";
    const p2Label = is2P ? "P2" : "OPPONENT";

    // 1. Blackboard chalk announcement
    if (outcome.type === 'DRAW_REFLICK') {
      updateBlackboardDisplay("ROUND DRAW! RE-FLICK");
    } else if (outcome.type === 'MATCH_WIN_PLAYER') {
      updateBlackboardDisplay(`${p1Label} WINS MATCH! [${outcome.score.player} - ${outcome.score.opponent}]`);
    } else if (outcome.type === 'MATCH_WIN_OPPONENT') {
      updateBlackboardDisplay(`${p2Label} WINS MATCH! [${outcome.score.opponent} - ${outcome.score.player}]`);
    } else if (outcome.winner === 'player') {
      updateBlackboardDisplay(`ROUND WON! [${p1Label}: ${outcome.score.player} - ${outcome.score.opponent}]`);
    } else if (outcome.winner === 'opponent') {
      updateBlackboardDisplay(`ROUND WON! [${p2Label}: ${outcome.score.opponent} - ${outcome.score.player}]`);
    } else {
      updateBlackboardDisplay(`R${outcome.currentRound} [${p1Label}: ${outcome.score.player} - ${outcome.score.opponent}]`);
    }

    // 2. HUD Status message
    if (window.hudController && outcome.score) {
      window.hudController.updateScore(outcome.score.player, outcome.score.opponent, this.rules.targetWins || 3);
      if (outcome.winner === 'player') {
        window.hudController.setBanner('KNOCKOUT! 💥', `${p1Label} scored a point!`, 'POINT');
      } else if (outcome.winner === 'opponent') {
        window.hudController.setBanner('KNOCKOUT! 💥', `${p2Label} scored a point!`, 'POINT');
      } else if (outcome.reFlick) {
        window.hudController.setBanner('DOUBLE FALL! 🔄', 'Both pens fell! Re-flick round!', 'TIE');
      }
    }

    // 3. Update Turn Badge
    this.updateTurnBadge();

    // 4. Decisive Round or Double Fall -> Reset round with score intact
    if (outcome.reFlick || outcome.winner) {
      if (!outcome.matchOver) {
        setTimeout(() => {
          updateBlackboardDisplay(null);
          this.resetRound();
        }, 1600);
      } else {
        // Match Over!
        this.updateTurnBadge();
        const isWin = outcome.winner === 'player';
        const progResult = this.progression.processMatchEnd({
          isWin,
          score: outcome.score,
          difficulty: this.difficulty || 'normal',
          mode: this.rules.mode,
          stageId: this.currentStageId || this.progression.currentStageId || 1,
          playerPen: this.playerPenConfigKey || 'reynolds045',
          hasSpinFlick: this.playerUsedSpin || false,
          roundHistory: this.rules.roundHistory.map(r => r.winner)
        });

        // Step 2.5: Auto-save progression state to persistent storage
        this.storage.save({ progression: this.progression.getState() });

        const chalkMsg = isWin 
          ? `VICTORY! +${progResult.earnedXp} XP (${progResult.levelInfo.title})`
          : `DEFEAT! +${progResult.earnedXp} XP (${progResult.levelInfo.title})`;
        updateBlackboardDisplay(chalkMsg);

        // Step 3.8: Trigger School Report Card Certificate modal after knockout celebration
        setTimeout(() => {
          if (window.matchResultController) {
            window.matchResultController.show({
              isWin,
              mode: this.rules.mode,
              score: outcome.score,
              roundHistory: this.rules.roundHistory,
              progResult,
              playerPen: this.playerPenConfigKey || 'reynolds045',
              opponentPen: this.opponentPenConfigKey || 'trimax',
              opponentName: is2P ? 'Player 2 (Rival)' : (window.currentStageOpponent?.name || "Bunty 'Backbencher'")
            });
          }
        }, 2200);
      }
      return;
    }

    // 5. Safe Duel (Both on table) -> Pass turn
    if (outcome.nextTurn === 'opponent') {
      if (this.rules.mode === 'bot') {
        setTimeout(() => this.executeBotFlick(), 750);
      }
    }
  }

  handleTimeUp(data) {
    if (this.rules.matchOver) return;
    if (window.hudController && typeof window.hudController.isVisible === 'function' && !window.hudController.isVisible()) return;

    const timedOutTurn = (data && data.timedOutTurn) || (this.rules.activeTurn === 'player' ? 'P1' : 'BOT');
    const outcome = this.rules.awardFoulPoint(timedOutTurn);
    const is2P = this.rules.mode === 'pass_and_play';

    if (window.hudController && outcome.score) {
      window.hudController.updateScore(outcome.score.player, outcome.score.opponent, this.rules.targetWins || 3);
    }

    if (!outcome.matchOver) {
      setTimeout(() => {
        updateBlackboardDisplay(null);
        this.resetRound();
        this.updateTurnBadge();
        if (window.hudController) {
          window.hudController.startTimer(165);
          window.hudController.setTurn(this.rules.activeTurn === 'player' ? 'P1' : (is2P ? 'P2' : 'BOT'));
        }
      }, 2200);
    } else {
      // Match Over on Time Foul!
      const isWin = outcome.winner === 'player';
      const progResult = this.progression.processMatchEnd({
        isWin,
        score: outcome.score,
        difficulty: this.difficulty || 'normal',
        mode: this.rules.mode,
        stageId: this.currentStageId || this.progression.currentStageId || 1,
        playerPen: this.playerPenConfigKey || 'reynolds045',
        hasSpinFlick: this.playerUsedSpin || false,
        roundHistory: this.rules.roundHistory.map(r => r.winner)
      });

      this.storage.save({ progression: this.progression.getState() });

      const chalkMsg = isWin 
        ? `VICTORY! +${progResult.earnedXp} XP (${progResult.levelInfo.title})`
        : `DEFEAT! +${progResult.earnedXp} XP (${progResult.levelInfo.title})`;
      updateBlackboardDisplay(chalkMsg);

      setTimeout(() => {
        if (window.matchResultController) {
          window.matchResultController.show({
            isWin,
            mode: this.rules.mode,
            score: outcome.score,
            roundHistory: this.rules.roundHistory,
            progResult,
            playerPen: this.playerPenConfigKey || 'reynolds045',
            opponentPen: this.opponentPenConfigKey || 'trimax',
            opponentName: is2P ? 'Player 2 (Rival)' : (window.currentStageOpponent?.name || "Bunty 'Backbencher'")
          });
        }
      }, 2200);
    }
  }

  updateTurnBadge() {
    const is2P = this.rules.mode === 'pass_and_play';

    if (window.hudController) {
      if (this.rules.matchOver) {
        const isWin = this.rules.winner === 'player';
        window.hudController.setBanner(
          isWin ? 'VICTORY! 🏆' : 'DEFEATED! 💀',
          isWin ? 'Great match! Bench belongs to you!' : 'Defeated by rival! Better luck next recess!',
          isWin ? 'WINNER' : 'FALLEN',
          4000
        );
      } else if (this.rules.state === MatchState.P1_AIMING) {
        window.hudController.setTurn('P1');
      } else if (this.rules.state === MatchState.OPPONENT_AIMING) {
        window.hudController.setTurn(is2P ? 'P2' : 'BOT');
      }
    }
  }

  changePen(side, penKey) {
    const config = PEN_CONFIGS[penKey];
    if (!config) return;

    if (side === 'player') {
      this.playerPenConfigKey = penKey;
      if (this.playerPen) {
        this.scene.remove(this.playerPen.mesh);
        this.world.removeRigidBody(this.playerPen.body);
      }
      this.playerPen = this.spawnPen(config, new THREE.Vector3(getRandomSpawnOffsetX(), config.radius, SPAWN_Z_PLAYER), Math.PI / 2);
      this.storage.save({ profile: { selectedPlayerPen: penKey } });
    } else {
      this.opponentPenConfigKey = penKey;
      if (this.opponentPen) {
        this.scene.remove(this.opponentPen.mesh);
        this.world.removeRigidBody(this.opponentPen.body);
      }
      this.opponentPen = this.spawnPen(config, new THREE.Vector3(getRandomSpawnOffsetX(), config.radius, SPAWN_Z_OPPONENT), Math.PI / 2);
      this.storage.save({ profile: { selectedOpponentPen: penKey } });
    }

    this.resetRound();
  }

  clearCareerData() {
    this.storage.clear();
    this.progression.reset();
    this.syncUIWithStorage();
    this.resetSandbox();
    return "Career data cleared successfully";
  }

  resetSandbox() {
    this.playerUsedSpin = false;
    this.rules.startMatch(this.rules.mode || 'bot');
    updateBlackboardDisplay("MATCH RESET: 0 - 0");
    setTimeout(() => updateBlackboardDisplay(null), 1200);
    this.resetRound();
  }

  resetRound() {
    this.isSimulating = false;
    this.simStartTime = 0;
    this.stableStartTime = 0;
    this.playerPen.isFallen = false;
    this.opponentPen.isFallen = false;
    this.roundTurnCount = 0;
    this.restoreNormalGrip();

    const pConfig = PEN_CONFIGS[this.playerPenConfigKey || 'reynolds045'];
    const oConfig = PEN_CONFIGS[this.opponentPenConfigKey || 'trimax'];

    // Dynamic random offset: 3 to 7 cm natural slight angle ((random() - 0.5) * desk.width * 0.22)
    const pOffsetX = getRandomSpawnOffsetX();
    const oOffsetX = getRandomSpawnOffsetX();

    // Reset Player Pen (South: Z = +0.25m with random slight offset)
    const qPlayer = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
    this.playerPen.body.setTranslation(new RAPIER.Vector3(pOffsetX, pConfig.radius, SPAWN_Z_PLAYER), true);
    this.playerPen.body.setRotation({ x: qPlayer.x, y: qPlayer.y, z: qPlayer.z, w: qPlayer.w }, true);
    this.playerPen.body.setLinvel(new RAPIER.Vector3(0, 0, 0), true);
    this.playerPen.body.setAngvel(new RAPIER.Vector3(0, 0, 0), true);
    this.playerPen.prevPos.set(pOffsetX, pConfig.radius, SPAWN_Z_PLAYER);
    this.playerPen.currPos.copy(this.playerPen.prevPos);
    this.playerPen.prevQuat.copy(qPlayer);
    this.playerPen.currQuat.copy(qPlayer);

    // Reset Opponent Pen (North: Z = -0.25m with random slight offset)
    const qBot = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
    this.opponentPen.body.setTranslation(new RAPIER.Vector3(oOffsetX, oConfig.radius, SPAWN_Z_OPPONENT), true);
    this.opponentPen.body.setRotation({ x: qBot.x, y: qBot.y, z: qBot.z, w: qBot.w }, true);
    this.opponentPen.body.setLinvel(new RAPIER.Vector3(0, 0, 0), true);
    this.opponentPen.body.setAngvel(new RAPIER.Vector3(0, 0, 0), true);
    this.opponentPen.prevPos.set(oOffsetX, oConfig.radius, SPAWN_Z_OPPONENT);
    this.opponentPen.currPos.copy(this.opponentPen.prevPos);
    this.opponentPen.prevQuat.copy(qBot);
    this.opponentPen.currQuat.copy(qBot);

    if (window.hudController) {
      window.hudController.updatePower(0);
    }
    if (this.aimArrow) this.aimArrow.visible = false;

    if (!this.rules.matchOver) {
      this.rules.prepareNextRound();
      this.updateTurnBadge();

      // If it's Opponent/Bot's turn to take the opening shot of the round:
      if (this.rules.mode === 'bot' && this.rules.activeTurn === 'opponent') {
        setTimeout(() => {
          if (!this.rules.matchOver && this.rules.activeTurn === 'opponent' && !this.isSimulating) {
            this.executeBotFlick();
          }
        }, 900);
      }
    }
  }

  onWindowResize() {
    this.updateCameraView();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  storePreviousTransforms() {
    for (const pen of [this.playerPen, this.opponentPen]) {
      if (!pen || !pen.body) continue;
      pen.prevPos.copy(pen.currPos);
      pen.prevQuat.copy(pen.currQuat);
      const t = pen.body.translation();
      const r = pen.body.rotation();
      pen.currPos.set(t.x, t.y, t.z);
      pen.currQuat.set(r.x, r.y, r.z, r.w);
    }
  }

  interpolateTransforms(alpha) {
    for (const pen of [this.playerPen, this.opponentPen]) {
      if (!pen || !pen.mesh) continue;
      pen.mesh.position.lerpVectors(pen.prevPos, pen.currPos, alpha);
      pen.mesh.quaternion.slerpQuaternions(pen.prevQuat, pen.currQuat, alpha);
    }
  }

  // 5 Custom Physics Principles Implementation
  applyCustomPhysics(dt) {
    const halfW = DESK_WIDTH / 2;
    const halfL = DESK_LENGTH / 2;

    // Tactical Pen-to-Pen dynamic collision & realistic momentum transfer
    if (this.playerPen && this.opponentPen && !this.playerPen.isFallen && !this.opponentPen.isFallen) {
      const pP = this.playerPen.body.translation();
      const oP = this.opponentPen.body.translation();
      const penDist = Math.hypot(pP.x - oP.x, pP.z - oP.z);
      if (penDist < 0.08 && !this.collisionSoundCooldown) {
        const pLin = this.playerPen.body.linvel();
        const oLin = this.opponentPen.body.linvel();
        const relSpeed = Math.hypot(pLin.x - oLin.x, pLin.z - oLin.z);
        if (relSpeed > 0.20) {
          synth.playClack();
          this.collisionSoundCooldown = true;
          setTimeout(() => { this.collisionSoundCooldown = false; }, 320);

          // Kinetic impact: transfers 6-7 cm push to hit pen, decelerates attacker (no jholna / no edge fall)
          const isPlayerFast = Math.hypot(pLin.x, pLin.z) > Math.hypot(oLin.x, oLin.z);
          const movingPen = isPlayerFast ? this.playerPen : this.opponentPen;
          const hitPen = isPlayerFast ? this.opponentPen : this.playerPen;
          const mLin = movingPen.body.linvel();
          const moveSpeed = Math.hypot(mLin.x, mLin.z);

          if (moveSpeed > 0.25) {
            const pushDirX = mLin.x / moveSpeed;
            const pushDirZ = mLin.z / moveSpeed;
            const transferImpulse = 0.0118;
            hitPen.body.applyImpulse({ x: pushDirX * transferImpulse, y: 0, z: pushDirZ * transferImpulse }, true);
            movingPen.body.setLinvel({ x: mLin.x * 0.35, y: mLin.y, z: mLin.z * 0.35 }, true);
          }
        }
      }
    }

    for (const pen of [this.playerPen, this.opponentPen]) {
      if (!pen || !pen.body || pen.isFallen) continue;

      const pos = pen.body.translation();
      const rot = pen.body.rotation();
      const linvel = pen.body.linvel();
      const angvel = pen.body.angvel();
      const penQuat = new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w);

      const speed = Math.hypot(linvel.x, linvel.z);
      const isOverDesk = Math.abs(pos.x) <= halfW && Math.abs(pos.z) <= halfL && pos.y >= -0.01;

      if (isOverDesk && speed > 0.0001) {
        // Principle 1: Dual-Friction Model (Desk friction 0.60 scaled by pen material)
        const penMaterialFactor = pen.config.friction ? (pen.config.friction / 0.35) : 1.0;
        const muDesk = pen.customFriction || (DESK_FRICTION * penMaterialFactor);
        // Grounded tactile drag multiplier (5.5x for solid wood grip feel)
        const dragFactor = Math.max(0, 1.0 - muDesk * dt * 5.5);
        linvel.x *= dragFactor;
        linvel.z *= dragFactor;

        // Edge retention: only gentle retention for low-speed controlled slides (< 0.90 m/s); full 100% blind rushes overshoot off the edge into a self-fall foul!
        if (speed < 0.90 && pos.y >= -0.01 && Math.abs(pos.z) > 0.44 && Math.abs(pos.z) <= halfL) {
          const edgeProximity = (Math.abs(pos.z) - 0.44) / (halfL - 0.44);
          linvel.z *= Math.max(0, 1.0 - edgeProximity * dt * 3.0);
        }

        // Static Threshold (Damp Stop): smooth micro-deceleration curve
        if (speed < 0.035) {
          const dampBrake = Math.pow(speed / 0.035, 1.35);
          linvel.x *= dampBrake;
          linvel.z *= dampBrake;
          if (speed < 0.006) {
            linvel.x = 0;
            linvel.z = 0;
          }
        }

        // Principle 2: Angular Damping & Spin Dynamics (Nib vs Body Pivot)
        // omega_next = omega * (1 - spinDamping * dt)
        const spinDamping = pen.config.angularDamping || 0.80;
        angvel.y *= Math.max(0, 1.0 - spinDamping * dt * 2.5);

        // Asymmetric friction: metal nib slides freely, plastic body drags -> generates drift pivot
        const penDir = new THREE.Vector3(0, 0, 1).applyQuaternion(penQuat);
        const lateralDrift = linvel.x * penDir.z - linvel.z * penDir.x;
        angvel.y += lateralDrift * 0.12 * dt;

        pen.body.setLinvel(linvel, true);
        pen.body.setAngvel(angvel, true);
      }

      // Principle 4: Edge-Hang & Table Fall Physics
      // Center of Gravity or >50% length hanging over table border
      const halfLen = pen.config.length / 2;
      const nibWorld = new THREE.Vector3(0, 0, -halfLen).applyQuaternion(penQuat).add(new THREE.Vector3(pos.x, pos.y, pos.z));
      const capWorld = new THREE.Vector3(0, 0, halfLen).applyQuaternion(penQuat).add(new THREE.Vector3(pos.x, pos.y, pos.z));

      const isComOverEdge = Math.abs(pos.x) > halfW || Math.abs(pos.z) > halfL;
      const isNibOverEdge = Math.abs(nibWorld.x) > halfW || Math.abs(nibWorld.z) > halfL;
      const isCapOverEdge = Math.abs(capWorld.x) > halfW || Math.abs(capWorld.z) > halfL;

      if (isComOverEdge || (isNibOverEdge && isCapOverEdge)) {
        if (pos.y >= -0.05) {
          // Horizontal slide dampens at edge
          linvel.x *= 0.90;
          linvel.z *= 0.90;

          // Induce realistic tipping torque downwards over edge
          if (pos.x > halfW) {
            angvel.z -= 4.5 * dt; // tilts down right edge
          } else if (pos.x < -halfW) {
            angvel.z += 4.5 * dt; // tilts down left edge
          }

          if (pos.z > halfL) {
            angvel.x += 4.5 * dt; // tilts down front edge
          } else if (pos.z < -halfL) {
            angvel.x -= 4.5 * dt; // tilts down back edge
          }

          pen.body.setLinvel(linvel, true);
          pen.body.setAngvel(angvel, true);
        }
      }
    }
  }

  // Principle 5: Fixed Timestep + Substepping & State Interpolation (Zero Stuttering)
  animate(timestamp = 0) {
    requestAnimationFrame((t) => this.animate(t));

    if (!this.lastTime) this.lastTime = timestamp;
    let dt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;
    if (dt > 0.1) dt = 0.1;

    // Rotate nostalgic classroom ceiling fan
    if (this.deskMesh && this.deskMesh.userData && this.deskMesh.userData.ceilingFan) {
      this.deskMesh.userData.ceilingFan.rotation.y += dt * 2.8;
    }

    // Freeze physics if match is paused
    if (window.hudController && typeof window.hudController.isPaused === 'function' && window.hudController.isPaused()) {
      this.renderer.render(this.scene, this.camera);
      return;
    }

    this.accumulator += dt;

    while (this.accumulator >= this.fixedTimeStep) {
      this.storePreviousTransforms();
      this.applyCustomPhysics(this.fixedTimeStep);
      this.world.step();
      this.checkPhysicsSettled();
      this.accumulator -= this.fixedTimeStep;
    }

    const alpha = Math.min(this.accumulator / this.fixedTimeStep, 1.0);
    this.interpolateTransforms(alpha);

    this.renderer.render(this.scene, this.camera);
  }
}

function bootGame() {
  if (!window.gameEngine) {
    window.gameEngine = new GameEngine();
    window.gameEngine.init().catch(err => {
      console.error("GameEngine init failed:", err);
    });
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootGame);
} else {
  bootGame();
}
