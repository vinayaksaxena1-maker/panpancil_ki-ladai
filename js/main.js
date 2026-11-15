import * as THREE from 'three';
import RAPIER from 'rapier';
import { createDeskMesh, updateBlackboardDisplay } from './desk.js?v=blackboard_ready_v3';
import { PEN_CONFIGS, createPenMesh } from './pens.js?v=pbr_cel_decals2';
import { synth } from './sound.js';
import { career, TROPHIES, TITLES } from './career.js';
import { MatchRules, MatchState } from './rules.js?v=p2_s1';

// Table dimensions (meters) - Vertical Student Duel Desk (0.70m x 1.00m)
const DESK_WIDTH = 0.70;      // 70 cm width (X-axis, East-West)
const DESK_LENGTH = 1.00;     // 100 cm length (Z-axis, North-South, Vertical)
const DESK_THICKNESS = 0.030; // 3 cm thickness

// Authentic baseline physics
const GRAVITY = -9.81;
const DESK_FRICTION = 0.33;
const DESK_RESTITUTION = 0.10;
const PEN_LINEAR_DAMPING = 0.06;
const PEN_ANGULAR_DAMPING = 0.80;
const PEN_RESTITUTION = 0.68; // ~70% Elasticity for crisp rigid plastic collision
const PEN_FRICTION = 0.30;

// Input & flick parameters (Calibrated for 1.00m table runway)
const DEAD_ZONE_PX = 12;
const J_MIN = 0.0020;
const J_MAX = 0.054;
const GAMMA = 1.45;
const MAX_PULL_VIEWPORT_RATIO = 0.34;

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
    this.difficulty = 'normal'; // Default: Normal Mode (Balanced Competition)

    // Phase 2 Step 2.1: Match Loop & Turn State Machine
    this.rules = new MatchRules({
      targetWins: 3, // Best of 5 (First to 3 wins)
      mode: 'bot',
      onScoreUpdate: (pScore, oScore, round) => {
        if (this.statusMsgEl && !this.rules.matchOver) {
          this.statusMsgEl.innerText = `Round ${round} (Best of 5) | [P1: ${pScore} - ${oScore} Opponent]`;
        }
      }
    });
    this.rules.startMatch('bot');

    // Phase 1 Pure Physics Sandbox State
    this.playerPenConfigKey = 'reynolds045';
    this.opponentPenConfigKey = 'trimax';
    this.collisionSoundCooldown = false;

    // 3D Raycasting
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.aimArrow = null;

    // HUD references
    this.powerMeterEl = document.getElementById('power-fill');
    this.turnBadgeEl = document.getElementById('turn-badge');
    this.statusMsgEl = document.getElementById('status-msg');

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
    this.scene.background = new THREE.Color(0x5e7563); // Matches upper classroom wall color

    // Warm classroom overhead lighting
    const ambientLight = new THREE.AmbientLight(0xfff7ee, 1.25);
    this.scene.add(ambientLight);

    const deskLight = new THREE.DirectionalLight(0xffffff, 2.3);
    deskLight.position.set(0.5, 2.2, 0.4);
    deskLight.castShadow = true;
    deskLight.shadow.mapSize.width = 2048;
    deskLight.shadow.mapSize.height = 2048;
    deskLight.shadow.camera.near = 0.5;
    deskLight.shadow.camera.far = 5;
    deskLight.shadow.camera.left = -1.5;
    deskLight.shadow.camera.right = 1.5;
    deskLight.shadow.camera.top = 2.0;
    deskLight.shadow.camera.bottom = -2.0;
    deskLight.shadow.bias = -0.0005;
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
    this.renderer.toneMappingExposure = 1.05;
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
    // Player Pen: Reynolds 045 near player edge (z = +0.35m, nib pointing left, cap right)
    this.playerPen = this.spawnPen(
      PEN_CONFIGS.reynolds045, 
      new THREE.Vector3(0, PEN_CONFIGS.reynolds045.radius, 0.35), 
      Math.PI / 2
    );

    // Opponent Pen: Reynolds Trimax near far edge (z = -0.35m, nib pointing left, cap right)
    this.opponentPen = this.spawnPen(
      PEN_CONFIGS.trimax, 
      new THREE.Vector3(0, PEN_CONFIGS.trimax.radius, -0.35), 
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

  setDifficulty(mode) {
    if (!['easy', 'normal', 'hard'].includes(mode)) return;
    this.difficulty = mode;

    document.querySelectorAll('.diff-btn').forEach(btn => {
      btn.classList.remove('active', 'easy', 'normal', 'hard');
      if (btn.dataset.diff === mode) {
        btn.classList.add('active', mode);
      }
    });

    if (this.statusMsgEl) {
      const modeLabels = {
        easy: "Easy Mode (Aasan)",
        normal: "Normal Mode (Balanced)",
        hard: "Hard Mode (Class Champion)"
      };
      this.statusMsgEl.innerText = `Bot AI: ${modeLabels[mode]}`;
    }
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
      .setFriction(config.friction || PEN_FRICTION)
      .setRestitution(config.restitution || PEN_RESTITUTION);

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
      if (this.isSimulating || !this.rules.isInteractionAllowed('player')) return;

      const hit = getIntersectionPoint(e);
      if (!hit) return;

      const pPos = this.playerPen.body.translation();
      const pRot = this.playerPen.body.rotation();
      const penQuat = new THREE.Quaternion(pRot.x, pRot.y, pRot.z, pRot.w);
      const halfLen = this.playerPen.config.length / 2;

      // Real 3D endpoints in world space
      const capLocal = new THREE.Vector3(0, 0, halfLen * 0.85).applyQuaternion(penQuat);
      const nibLocal = new THREE.Vector3(0, 0, -halfLen * 0.85).applyQuaternion(penQuat);

      const capWorld = new THREE.Vector3(pPos.x, pPos.y, pPos.z).add(capLocal);
      const nibWorld = new THREE.Vector3(pPos.x, pPos.y, pPos.z).add(nibLocal);

      const distToCap = hit.distanceTo(capWorld);
      const distToNib = hit.distanceTo(nibWorld);

      if (Math.min(distToCap, distToNib) > 0.35) {
        return; // Touched away from pen
      }

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

      if (this.statusMsgEl) {
        this.statusMsgEl.innerText = this.activeFlickZone === 'cap' ? '🎯 Aiming from DHAKKAN (Cap)...' : '🎯 Aiming from NIB (Tip)...';
      }
    };

    const onPointerMove = (e) => {
      if (!this.isDragging) return;
      this.dragCurrent.set(e.clientX, e.clientY);
      this.smoothedDrag.lerp(this.dragCurrent, 0.45);

      const pxDiffX = this.smoothedDrag.x - this.dragStart.x;
      const pxDiffY = this.smoothedDrag.y - this.dragStart.y;
      const dragPx = Math.hypot(pxDiffX, pxDiffY);

      if (dragPx < DEAD_ZONE_PX) {
        if (this.powerMeterEl) this.powerMeterEl.style.width = '0%';
        return;
      }

      const maxPullPx = window.innerHeight * MAX_PULL_VIEWPORT_RATIO;
      const pullFrac = Math.min((dragPx - DEAD_ZONE_PX) / maxPullPx, 1.0);
      const curvedPower = Math.pow(pullFrac, GAMMA);

      if (this.powerMeterEl) {
        this.powerMeterEl.style.width = `${curvedPower * 100}%`;
      }

      const aimDir = new THREE.Vector3(-pxDiffX, 0, -pxDiffY).normalize();
      this.aimArrow.setDirection(aimDir);
      this.aimArrow.setLength(Math.min(curvedPower * 0.28, 0.28));
    };

    const onPointerUp = () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.aimArrow.visible = false;
      if (this.powerMeterEl) this.powerMeterEl.style.width = '0%';

      const pxDiffX = this.smoothedDrag.x - this.dragStart.x;
      const pxDiffY = this.smoothedDrag.y - this.dragStart.y;
      const dragPx = Math.hypot(pxDiffX, pxDiffY);

      if (dragPx >= DEAD_ZONE_PX) {
        this.executePlayerFlick(-pxDiffX, -pxDiffY, dragPx);
      }
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }

  executePlayerFlick(dirX, dirZ, dragPx) {
    this.isSimulating = true;
    this.simStartTime = performance.now();
    this.stableStartTime = 0;
    this.rules.onFlickExecuted('player');
    this.updateTurnBadge();
    synth.playFlick();

    const maxPullPx = window.innerHeight * MAX_PULL_VIEWPORT_RATIO;
    const pullFrac = Math.min((dragPx - DEAD_ZONE_PX) / maxPullPx, 1.0);
    const curvedPower = Math.pow(pullFrac, GAMMA);
    const impulseMag = J_MIN + curvedPower * (J_MAX - J_MIN);

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

    this.playerPen.body.applyImpulseAtPoint(impulse, flickPt, true);

    if (this.statusMsgEl) this.statusMsgEl.innerText = "Flick executed! Waiting to settle...";
  }

  executeBotFlick() {
    if (this.isSimulating || this.rules.matchOver || !this.opponentPen || this.opponentPen.isFallen) return;

    this.isSimulating = true;
    this.simStartTime = performance.now();
    this.stableStartTime = 0;
    this.rules.onFlickExecuted('opponent');
    this.updateTurnBadge();
    synth.playFlick();

    const mode = this.difficulty || 'normal';
    const pPos = this.playerPen.body.translation();
    const oPos = this.opponentPen.body.translation();
    const oRot = this.opponentPen.body.rotation();
    const oQuat = new THREE.Quaternion(oRot.x, oRot.y, oRot.z, oRot.w);

    const halfW = DESK_WIDTH / 2;
    const halfL = DESK_LENGTH / 2;

    const toPlayer = new THREE.Vector3(pPos.x - oPos.x, 0, pPos.z - oPos.z);
    const distanceToTarget = toPlayer.length();

    // 1. Tactical Target Selection per Mode
    let aimOffsetX = 0;
    if (mode === 'hard') {
      const distToLeft = Math.abs(pPos.x - (-halfW));
      const distToRight = Math.abs(halfW - pPos.x);
      if (distToLeft < distToRight && distToLeft < 0.22) {
        aimOffsetX = -0.018; // Deflect towards left drop
      } else if (distToRight < 0.22) {
        aimOffsetX = 0.018;  // Deflect towards right drop
      }
    } else if (mode === 'normal') {
      // Normal Mode: subtle edge cut only if player is near extreme edge
      const distToLeft = Math.abs(pPos.x - (-halfW));
      const distToRight = Math.abs(halfW - pPos.x);
      if (distToLeft < 0.12) aimOffsetX = -0.010;
      else if (distToRight < 0.12) aimOffsetX = 0.010;
    }
    // Easy Mode: zero offset, aims straight at player center

    const targetPos = new THREE.Vector3(pPos.x + aimOffsetX, oPos.y, pPos.z);
    const dir = new THREE.Vector3().subVectors(targetPos, new THREE.Vector3(oPos.x, oPos.y, oPos.z));
    dir.y = 0;
    dir.normalize();

    // 2. Aim Error Variance per Mode
    let aimErrorRad = 0;
    if (mode === 'easy') {
      aimErrorRad = (Math.random() - 0.5) * 0.28; // ±16° wide error spread (easy to dodge/miss)
    } else if (mode === 'normal') {
      aimErrorRad = (Math.random() - 0.5) * 0.11; // ±6.5° realistic human spread
    } else {
      aimErrorRad = (Math.random() - 0.5) * 0.05; // ±3° precise sharp spread
    }
    dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), aimErrorRad);

    // 3. Distance Kinematics & Velocity Calculation
    const effectiveDecel = (DESK_FRICTION * 9.81) + 0.40; // ~3.6 m/s²
    let targetSpeed = 0;

    // CRITICAL INVARIANT: START-OF-ROUND SAFETY (Zero Turn-1 Instant KO in ALL modes)
    // When distance > 0.42m (e.g. 0.70m initial runway), Bot advances into play zone without blasting player off
    if (distanceToTarget > 0.42) {
      if (mode === 'easy') {
        // Advances ~55-70% of runway, safely stopping in middle zone
        targetSpeed = Math.sqrt(2 * effectiveDecel * distanceToTarget * 0.65);
      } else if (mode === 'normal') {
        // Advances into mid-desk / gentle approach, reaching player with soft graze
        const reach = Math.sqrt(2 * effectiveDecel * distanceToTarget);
        targetSpeed = reach * 0.90 + 0.15;
      } else {
        // Hard: Controlled approach / tactical mid-desk pressure
        const reach = Math.sqrt(2 * effectiveDecel * distanceToTarget);
        targetSpeed = reach * 0.95 + 0.30;
      }
    } else {
      // MID-TO-CLOSE RANGE (< 0.42m) — Realistic Contest
      const reachSpeed = Math.sqrt(2 * effectiveDecel * Math.max(distanceToTarget, 0.10));
      if (mode === 'easy') {
        // Weak punch, often falls short or grazes gently
        const punchSpeed = 0.15 + Math.random() * 0.25;
        targetSpeed = reachSpeed + punchSpeed;
      } else if (mode === 'normal') {
        // Balanced punch, solid competition without overpowered instant blast
        const punchSpeed = 0.45 + Math.random() * 0.30;
        targetSpeed = reachSpeed + punchSpeed;
      } else {
        // Hard: Strong punch speed
        const punchSpeed = 0.85 + Math.random() * 0.40;
        targetSpeed = reachSpeed + punchSpeed;
      }
    }

    // Clamp speed safely per mode
    const maxSpeedLimit = mode === 'easy' ? 2.0 : (mode === 'normal' ? 2.5 : 3.2);
    targetSpeed = Math.min(targetSpeed, maxSpeedLimit);

    const botMass = this.opponentPen.config.mass || 0.0155;
    let botImpulseMagnitude = botMass * targetSpeed;

    // 4. Self-Preservation Check (Prevent over-flick suicide near edges)
    if (mode !== 'easy') {
      const distToPlayerEdge = Math.abs(halfL - targetPos.z);
      if (distToPlayerEdge < 0.10 && distanceToTarget < 0.25) {
        botImpulseMagnitude *= 0.85;
      }
    }

    // Safe impulse clamping
    botImpulseMagnitude = Math.min(Math.max(botImpulseMagnitude, 0.008), 0.048);

    // 5. Spin Cut-Shot vs Direct Strike
    // Easy: 0% spin (pure center hit)
    // Normal: 20% subtle spin
    // Hard: 60% aggressive spin
    const spinChance = mode === 'easy' ? 0.0 : (mode === 'normal' ? 0.20 : 0.60);
    const useSpinShot = Math.random() < spinChance;
    const penHalfLen = (this.opponentPen.config.length || 0.146) / 2;
    const flickOffsetLocal = new THREE.Vector3(0, 0, 0);

    if (useSpinShot) {
      const spinMultiplier = mode === 'hard' ? 0.72 : 0.40;
      const hitEnd = Math.random() > 0.5 ? spinMultiplier : -spinMultiplier;
      flickOffsetLocal.set(0, 0, penHalfLen * hitEnd);
    }

    const flickPtWorld = flickOffsetLocal.clone().applyQuaternion(oQuat).add(new THREE.Vector3(oPos.x, oPos.y, oPos.z));

    const impulse = new RAPIER.Vector3(dir.x * botImpulseMagnitude, 0.0, dir.z * botImpulseMagnitude);
    const flickPt = new RAPIER.Vector3(flickPtWorld.x, flickPtWorld.y, flickPtWorld.z);

    this.opponentPen.body.applyImpulseAtPoint(impulse, flickPt, true);

    const shotMsg = mode === 'easy' 
      ? "Opponent ka halka shot" 
      : (mode === 'normal' ? "Opponent ka balanced shot!" : "⚡ Opponent ka aggressive shot!");
    if (this.statusMsgEl) this.statusMsgEl.innerText = shotMsg;
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
      if (this.statusMsgEl) this.statusMsgEl.innerText = "💥 Player ki pen desk se gir gayi!";
      this.playerPen.body.setLinvel(new RAPIER.Vector3(0, -1.5, 0), true);
      this.playerPen.body.setAngvel(new RAPIER.Vector3(0, 0, 0), true);
    }

    if (!this.opponentPen.isFallen && isOutOfBounds(oPos)) {
      this.opponentPen.isFallen = true;
      synth.playThud();
      if (this.statusMsgEl) this.statusMsgEl.innerText = "🎉 Opponent ki pen table se out!";
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
    const outcome = this.rules.evaluateTurnOutcome(this.playerPen.isFallen, this.opponentPen.isFallen);

    // 1. Blackboard chalk announcement
    if (outcome.type === 'DRAW_REFLICK') {
      updateBlackboardDisplay("ROUND DRAW! RE-FLICK");
    } else if (outcome.type === 'MATCH_WIN_PLAYER') {
      updateBlackboardDisplay(`PLAYER WINS MATCH! [${outcome.score.player} - ${outcome.score.opponent}]`);
    } else if (outcome.type === 'MATCH_WIN_OPPONENT') {
      updateBlackboardDisplay(`OPPONENT WINS MATCH! [${outcome.score.opponent} - ${outcome.score.player}]`);
    } else if (outcome.winner === 'player') {
      updateBlackboardDisplay(`ROUND WON! [P1: ${outcome.score.player} - ${outcome.score.opponent}]`);
    } else if (outcome.winner === 'opponent') {
      updateBlackboardDisplay(`ROUND LOST! [P1: ${outcome.score.player} - ${outcome.score.opponent}]`);
    } else {
      updateBlackboardDisplay(`R${outcome.currentRound} [P1: ${outcome.score.player} - ${outcome.score.opponent}]`);
    }

    // 2. HUD Status message
    if (this.statusMsgEl) {
      this.statusMsgEl.innerText = outcome.message;
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
        if (this.statusMsgEl) {
          this.statusMsgEl.innerText = outcome.winner === 'player'
            ? `🏆 Match Winner! Player ${outcome.score.player} - ${outcome.score.opponent} Opponent (Tap 🔄 Reset to Play Again)`
            : `💀 Match Lost! Opponent ${outcome.score.opponent} - ${outcome.score.player} Player (Tap 🔄 Reset to Retry)`;
        }
      }
      return;
    }

    // 5. Safe Duel (Both on table) -> Pass turn
    if (outcome.nextTurn === 'opponent') {
      setTimeout(() => this.executeBotFlick(), 750);
    }
  }

  updateTurnBadge() {
    if (!this.turnBadgeEl) return;
    if (this.rules.matchOver) {
      this.turnBadgeEl.innerText = this.rules.winner === 'player' ? "🏆 MATCH WON" : "💀 MATCH LOST";
      this.turnBadgeEl.style.background = this.rules.winner === 'player' ? "#3f8b61" : "#c85b4a";
      return;
    }

    if (this.rules.state === MatchState.P1_AIMING) {
      this.turnBadgeEl.innerText = "Your Turn (Drag to Flick)";
      this.turnBadgeEl.style.background = "#3f8b61";
    } else if (this.rules.state === MatchState.OPPONENT_AIMING) {
      this.turnBadgeEl.innerText = "Opponent Aiming...";
      this.turnBadgeEl.style.background = "#c85b4a";
    } else if (this.rules.state === MatchState.SIMULATING || this.rules.state === MatchState.SETTLING) {
      this.turnBadgeEl.innerText = "Flicking...";
      this.turnBadgeEl.style.background = "#d9822b";
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
      this.playerPen = this.spawnPen(config, new THREE.Vector3(0, config.radius, 0.35), Math.PI / 2);
    } else {
      this.opponentPenConfigKey = penKey;
      if (this.opponentPen) {
        this.scene.remove(this.opponentPen.mesh);
        this.world.removeRigidBody(this.opponentPen.body);
      }
      this.opponentPen = this.spawnPen(config, new THREE.Vector3(0, config.radius, -0.35), Math.PI / 2);
    }

    this.resetRound();
    if (this.statusMsgEl) {
      this.statusMsgEl.innerText = `${side === 'player' ? 'Player' : 'Opponent'} pen: ${config.name} (${config.type}, ${(config.mass * 1000).toFixed(1)}g)`;
    }
  }

  resetSandbox() {
    this.rules.startMatch(this.rules.mode || 'bot');
    updateBlackboardDisplay("MATCH RESET: 0 - 0");
    setTimeout(() => updateBlackboardDisplay(null), 1200);
    this.resetRound();
    if (this.statusMsgEl) this.statusMsgEl.innerText = "🔄 Match Reset: Round 1 (Best of 5) | [P1: 0 - 0 Opponent]";
  }

  resetRound() {
    this.isSimulating = false;
    this.simStartTime = 0;
    this.stableStartTime = 0;
    this.playerPen.isFallen = false;
    this.opponentPen.isFallen = false;

    const pConfig = PEN_CONFIGS[this.playerPenConfigKey || 'reynolds045'];
    const oConfig = PEN_CONFIGS[this.opponentPenConfigKey || 'trimax'];

    // Reset Player Pen
    const qPlayer = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
    this.playerPen.body.setTranslation(new RAPIER.Vector3(0, pConfig.radius, 0.35), true);
    this.playerPen.body.setRotation({ x: qPlayer.x, y: qPlayer.y, z: qPlayer.z, w: qPlayer.w }, true);
    this.playerPen.body.setLinvel(new RAPIER.Vector3(0, 0, 0), true);
    this.playerPen.body.setAngvel(new RAPIER.Vector3(0, 0, 0), true);
    this.playerPen.prevPos.set(0, pConfig.radius, 0.35);
    this.playerPen.currPos.copy(this.playerPen.prevPos);
    this.playerPen.prevQuat.copy(qPlayer);
    this.playerPen.currQuat.copy(qPlayer);

    // Reset Opponent Pen
    const qBot = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
    this.opponentPen.body.setTranslation(new RAPIER.Vector3(0, oConfig.radius, -0.35), true);
    this.opponentPen.body.setRotation({ x: qBot.x, y: qBot.y, z: qBot.z, w: qBot.w }, true);
    this.opponentPen.body.setLinvel(new RAPIER.Vector3(0, 0, 0), true);
    this.opponentPen.body.setAngvel(new RAPIER.Vector3(0, 0, 0), true);
    this.opponentPen.prevPos.set(0, oConfig.radius, -0.35);
    this.opponentPen.currPos.copy(this.opponentPen.prevPos);
    this.opponentPen.prevQuat.copy(qBot);
    this.opponentPen.currQuat.copy(qBot);

    if (this.powerMeterEl) this.powerMeterEl.style.width = '0%';
    if (this.aimArrow) this.aimArrow.visible = false;

    if (!this.rules.matchOver) {
      this.rules.prepareNextRound();
      this.rules.setState(MatchState.P1_AIMING);
      this.updateTurnBadge();
      if (this.statusMsgEl) {
        this.statusMsgEl.innerText = `Round ${this.rules.currentRound} (Best of 5) | [P1: ${this.rules.score.player} - ${this.rules.score.opponent} Opponent]`;
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

    // Tactical Pen-to-Pen dynamic collision sound ("DHISHUM!")
    if (this.playerPen && this.opponentPen && !this.playerPen.isFallen && !this.opponentPen.isFallen) {
      const pP = this.playerPen.body.translation();
      const oP = this.opponentPen.body.translation();
      const penDist = Math.hypot(pP.x - oP.x, pP.z - oP.z);
      if (penDist < 0.12 && !this.collisionSoundCooldown) {
        const pLin = this.playerPen.body.linvel();
        const oLin = this.opponentPen.body.linvel();
        const relSpeed = Math.hypot(pLin.x - oLin.x, pLin.z - oLin.z);
        if (relSpeed > 0.12) {
          synth.playClack();
          this.collisionSoundCooldown = true;
          setTimeout(() => { this.collisionSoundCooldown = false; }, 260);
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
        // Principle 1: Dual-Friction Model (Coulomb Kinetic + Viscous Friction)
        // v_next = v * (1 - mu_desk * dt)
        const muDesk = pen.config.friction || DESK_FRICTION;
        const dragFactor = Math.max(0, 1.0 - muDesk * dt * 2.2);
        linvel.x *= dragFactor;
        linvel.z *= dragFactor;

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
