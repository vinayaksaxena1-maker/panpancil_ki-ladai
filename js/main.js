import * as THREE from 'three';
import RAPIER from 'rapier';
import { createDeskMesh } from './desk.js?v=2';
import { PEN_CONFIGS, createPenMesh } from './pens.js?v=2';
import { synth } from './sound.js';

// Table dimensions (meters) - Vertical Student Duel Desk (0.60m x 1.10m)
const DESK_WIDTH = 0.60;      // 60 cm width (X-axis, East-West)
const DESK_LENGTH = 1.10;     // 110 cm length (Z-axis, North-South, Vertical)
const DESK_THICKNESS = 0.030; // 3 cm thickness

// Authentic baseline physics
const GRAVITY = -9.81;
const DESK_FRICTION = 0.33;
const DESK_RESTITUTION = 0.10;
const PEN_LINEAR_DAMPING = 0.06;
const PEN_ANGULAR_DAMPING = 0.80;
const PEN_RESTITUTION = 0.68; // ~70% Elasticity for crisp rigid plastic collision
const PEN_FRICTION = 0.30;

// Input & flick parameters
const DEAD_ZONE_PX = 12;
const J_MIN = 0.0015;
const J_MAX = 0.0275;
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
    this.turn = 'player';
    this.stableStartTime = 0;

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

    // 4. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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

    // 6. Spawn 2 Pens FLAT HORIZONTALLY (East-West widthwise across desk, ~75cm apart)
    // Player Pen: Reynolds 045 near player edge (z = +0.375m)
    this.playerPen = this.spawnPen(
      PEN_CONFIGS.reynolds045, 
      new THREE.Vector3(0, PEN_CONFIGS.reynolds045.radius, 0.375), 
      -Math.PI / 2
    );

    // Opponent Pen: Reynolds Trimax near far edge (z = -0.375m)
    this.opponentPen = this.spawnPen(
      PEN_CONFIGS.trimax, 
      new THREE.Vector3(0, PEN_CONFIGS.trimax.radius, -0.375), 
      Math.PI / 2
    );

    // 7. Aim Arrow Helper
    const dir = new THREE.Vector3(0, 0, -1);
    this.aimArrow = new THREE.ArrowHelper(dir, new THREE.Vector3(0, 0, 0), 0.1, 0xf2c75c, 0.04, 0.03);
    this.aimArrow.visible = false;
    this.scene.add(this.aimArrow);

    // 8. Event Listeners & Natural Touch Controls
    window.addEventListener('resize', () => this.onWindowResize());
    this.setupNaturalTouchControls();

    // Start 120 Hz render loop
    this.animate();
  }

  updateCameraView() {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera.aspect = aspect;

    if (aspect >= 1.2) {
      // Landscape (PC / Laptop)
      this.camera.fov = 52;
      this.camera.position.set(0, 0.95, 1.08);
      this.camera.lookAt(0, 0.06, -0.16);
    } else if (aspect <= 0.75) {
      // Portrait (Mobile)
      this.camera.fov = 66;
      this.camera.position.set(0, 1.12, 0.96);
      this.camera.lookAt(0, 0.08, -0.16);
    } else {
      // Tablet / Medium
      this.camera.fov = 58;
      this.camera.position.set(0, 1.02, 1.02);
      this.camera.lookAt(0, 0.07, -0.16);
    }
    this.camera.updateProjectionMatrix();
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
      if (this.isSimulating || this.turn !== 'player') return;

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
    this.isSimulating = true;
    synth.playFlick();

    const pPos = this.playerPen.body.translation();
    const oPos = this.opponentPen.body.translation();

    // Bot aims from its cap towards player pen with slight realistic human error
    const dir = new THREE.Vector3(pPos.x - oPos.x, 0, pPos.z - oPos.z).normalize();
    const errorAngle = (Math.random() - 0.5) * 0.16;
    dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), errorAngle);

    const dist = Math.hypot(pPos.x - oPos.x, pPos.z - oPos.z);
    const powerFraction = Math.min(Math.max(dist / 0.85, 0.40), 0.90);
    const botImpulse = J_MIN + Math.pow(powerFraction, GAMMA) * (J_MAX - J_MIN);

    const impulse = new RAPIER.Vector3(dir.x * botImpulse, 0.0, dir.z * botImpulse);
    const flickPt = new RAPIER.Vector3(oPos.x, oPos.y, oPos.z);

    this.opponentPen.body.applyImpulseAtPoint(impulse, flickPt, true);

    if (this.statusMsgEl) this.statusMsgEl.innerText = "Opponent ne flick kiya!";
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
    }

    if (!this.opponentPen.isFallen && isOutOfBounds(oPos)) {
      this.opponentPen.isFallen = true;
      synth.playThud();
      if (this.statusMsgEl) this.statusMsgEl.innerText = "🎉 Opponent ki pen table se out!";
    }

    const isAtRest = (pSpeed < SETTLE_LIN_VEL && pRotSpeed < SETTLE_ANG_VEL) &&
                     (oSpeed < SETTLE_LIN_VEL && oRotSpeed < SETTLE_ANG_VEL);

    if (isAtRest) {
      if (!this.stableStartTime) {
        this.stableStartTime = performance.now();
      } else if (performance.now() - this.stableStartTime >= 300) {
        this.stableStartTime = 0;
        this.isSimulating = false;
        this.resolveTurnOutcome();
      }
    } else {
      this.stableStartTime = 0;
    }
  }

  resolveTurnOutcome() {
    if (this.playerPen.isFallen && this.opponentPen.isFallen) {
      if (this.statusMsgEl) this.statusMsgEl.innerText = "⚖️ Dono pens gir gayin! Draw / Re-flick!";
      setTimeout(() => this.resetRound(), 1500);
      return;
    }

    if (this.opponentPen.isFallen) {
      if (this.statusMsgEl) this.statusMsgEl.innerText = "🏆 Round Player jeeta! Badhai ho!";
      setTimeout(() => this.resetRound(), 1800);
      return;
    }

    if (this.playerPen.isFallen) {
      if (this.statusMsgEl) this.statusMsgEl.innerText = "❌ Opponent round jeet gaya!";
      setTimeout(() => this.resetRound(), 1800);
      return;
    }

    // Switch Turn
    this.turn = (this.turn === 'player') ? 'bot' : 'player';
    if (this.turnBadgeEl) {
      this.turnBadgeEl.innerText = this.turn === 'player' ? "Your Turn (Drag to Flick)" : "Classmate's Turn...";
      this.turnBadgeEl.style.background = this.turn === 'player' ? "#3f8b61" : "#c85b4a";
    }
    if (this.statusMsgEl) {
      this.statusMsgEl.innerText = this.turn === 'player' ? "Apni bari: pen par touch karke drag karo!" : "Opponent ki bari...";
    }

    if (this.turn === 'bot') {
      setTimeout(() => this.executeBotFlick(), 700);
    }
  }

  resetRound() {
    this.playerPen.isFallen = false;
    this.opponentPen.isFallen = false;

    // Reset pens flat horizontally across desk length (~75cm apart)
    const qPlayer = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
    this.playerPen.body.setTranslation(new RAPIER.Vector3(0, PEN_CONFIGS.reynolds045.radius, 0.375), true);
    this.playerPen.body.setRotation({ x: qPlayer.x, y: qPlayer.y, z: qPlayer.z, w: qPlayer.w }, true);
    this.playerPen.body.setLinvel(new RAPIER.Vector3(0, 0, 0), true);
    this.playerPen.body.setAngvel(new RAPIER.Vector3(0, 0, 0), true);
    this.playerPen.prevPos.set(0, PEN_CONFIGS.reynolds045.radius, 0.375);
    this.playerPen.currPos.copy(this.playerPen.prevPos);
    this.playerPen.prevQuat.copy(qPlayer);
    this.playerPen.currQuat.copy(qPlayer);

    const qBot = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
    this.opponentPen.body.setTranslation(new RAPIER.Vector3(0, PEN_CONFIGS.trimax.radius, -0.375), true);
    this.opponentPen.body.setRotation({ x: qBot.x, y: qBot.y, z: qBot.z, w: qBot.w }, true);
    this.opponentPen.body.setLinvel(new RAPIER.Vector3(0, 0, 0), true);
    this.opponentPen.body.setAngvel(new RAPIER.Vector3(0, 0, 0), true);
    this.opponentPen.prevPos.set(0, PEN_CONFIGS.trimax.radius, -0.375);
    this.opponentPen.currPos.copy(this.opponentPen.prevPos);
    this.opponentPen.prevQuat.copy(qBot);
    this.opponentPen.currQuat.copy(qBot);

    this.turn = 'player';
    if (this.turnBadgeEl) {
      this.turnBadgeEl.innerText = "Your Turn (Drag to Flick)";
      this.turnBadgeEl.style.background = "#3f8b61";
    }
    if (this.statusMsgEl) this.statusMsgEl.innerText = "Ready! Touch Dhakkan or Nib & flick!";
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

window.addEventListener('DOMContentLoaded', () => {
  window.gameEngine = new GameEngine();
  window.gameEngine.init();
});
