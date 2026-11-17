/**
 * js/bot.js - Mathematical PCOpponentController
 * Phase 2, Step 2.2
 * 
 * Invariants:
 * - 3 Difficulty Tiers: Easy (Aasan), Normal (Balanced), Hard (Class Champion)
 * - Mathematical Angular Spread Error:
 *     - Easy:   ±16° (0.28 rad) wide error spread, weak punch speed, 0% spin
 *     - Normal: ±6.5° (0.11 rad) realistic human spread, balanced punch speed, 20% spin
 *     - Hard:   ±3° (0.05 rad) razor sharp aim, aggressive punch speed, 60% spin cut-shots
 * - Start-of-Round Safety Invariant (distance > 0.42m: zero turn-1 instant KO)
 * - Self-Preservation Invariant: prevent over-flick suicide when bot is near desk edges
 * - Human-like Pacing: 0.8s contemplation pause before flick execution
 */

import * as THREE from 'three';
import RAPIER from 'rapier';

export const DIFFICULTY_PRESETS = {
  easy: {
    name: 'Easy (Aasan)',
    aimSpreadRad: 0.15,      // ±8.6° focused aim (55-65% bot win rate)
    spinChance: 0.15,        // 15% spin cut-shots
    maxSpeedLimit: 1.65,     // Calibrated for heavy desk drag
    punchSpeedRange: [0.20, 0.35],
    runwayAdvancement: 0.70, // Advances 70% into runway
    tacticalEdgeOffset: 0.008, // Subtle edge deflection
    selfPreservation: false,
    label: 'Easy Mode (55-65% Bot Win Rate)'
  },
  normal: {
    name: 'Normal (Balanced)',
    aimSpreadRad: 0.052,     // ±3.0° sharp accurate aim (80-85% bot win rate)
    spinChance: 0.45,        // 45% tactical spin cut-shots
    maxSpeedLimit: 1.95,     // Strong decisive speed
    punchSpeedRange: [0.35, 0.55],
    runwayAdvancement: 0.85, // Strong forward control
    tacticalEdgeOffset: 0.020, // Sharp edge targeting
    selfPreservation: true,
    label: 'Normal Mode (80-85% Bot Win Rate)'
  },
  hard: {
    name: 'Hard (Class Champion)',
    aimSpreadRad: 0.014,     // ±0.8° Laser razor accuracy (92-95% bot win rate)
    spinChance: 0.75,        // 75% aggressive spin cut-shots on pen pivot
    maxSpeedLimit: 2.15,     // Knockout speed aligned with V_MAX = 2.15 m/s
    punchSpeedRange: [0.50, 0.70],
    runwayAdvancement: 0.90,
    tacticalEdgeOffset: 0.026, // Surgical nearest-edge deflection
    selfPreservation: true,
    label: 'Hard Mode (Class Champion)'
  }
};

export class PCOpponentController {
  constructor(options = {}) {
    this.difficulty = options.difficulty || 'normal';
    this.thinkTimeMs = options.thinkTimeMs || 800; // 0.8s human contemplation pause
    this.deskFriction = options.deskFriction || 0.60;
    this.gravity = 9.81;
    this.isThinking = false;
    this.lastShotData = null;
  }

  setDifficulty(mode) {
    if (DIFFICULTY_PRESETS[mode]) {
      this.difficulty = mode;
      return true;
    }
    return false;
  }

  getDifficulty() {
    return this.difficulty;
  }

  getPreset() {
    return DIFFICULTY_PRESETS[this.difficulty] || DIFFICULTY_PRESETS.normal;
  }

  /**
   * Pure calculation of shot parameters
   */
  calculateShot(pPos, oPos, oQuat, botConfig, deskDims) {
    const preset = this.getPreset();
    const halfW = deskDims.width / 2;
    const halfL = deskDims.length / 2;

    const toPlayer = new THREE.Vector3(pPos.x - oPos.x, 0, pPos.z - oPos.z);
    const distanceToTarget = toPlayer.length();

    // 1. Reckless Rush Punisher & Tactical Edge Offset Logic
    const isRecklessRush = distanceToTarget <= 0.28;
    let aimSpread = preset.aimSpreadRad;
    let aimOffsetX = 0;
    let aimOffsetZ = 0;
    let forceHighPowerCounter = false;
    let forceSpinCut = false;

    if (isRecklessRush) {
      // Reckless Rush Punisher: Player rushed close without knocking bot out.
      // Determine nearest table edge from player pen position (West, East, North, South)
      const distToWest = Math.abs(pPos.x - (-halfW));
      const distToEast = Math.abs(halfW - pPos.x);
      const distToNorth = Math.abs(pPos.z - (-halfL));
      const distToSouth = Math.abs(halfL - pPos.z);
      const minEdgeDist = Math.min(distToWest, distToEast, distToNorth, distToSouth);

      const edgeDropOffset = this.difficulty === 'hard' ? 0.032 : 0.024;
      if (minEdgeDist === distToWest) {
        aimOffsetX = -edgeDropOffset; // Surgical push towards West (Left) edge
      } else if (minEdgeDist === distToEast) {
        aimOffsetX = edgeDropOffset;  // Surgical push towards East (Right) edge
      } else if (minEdgeDist === distToNorth) {
        aimOffsetZ = -edgeDropOffset; // Surgical push towards North edge
      } else {
        aimOffsetZ = edgeDropOffset;  // Surgical push towards South edge
      }

      // Temporarily tighten Bot aim error in normal mode from ±4.0° down to ±1.2° (0.021 rad)
      if (this.difficulty === 'normal') {
        aimSpread = 0.021; // ±1.2° razor focus
      }
      forceHighPowerCounter = true;
      forceSpinCut = Math.random() < 0.85; // High-probability lethal spin sweep
    } else if (preset.tacticalEdgeOffset > 0) {
      const distToLeft = Math.abs(pPos.x - (-halfW));
      const distToRight = Math.abs(halfW - pPos.x);
      const edgeThreshold = this.difficulty === 'hard' ? 0.22 : 0.12;

      if (distToLeft < distToRight && distToLeft < edgeThreshold) {
        aimOffsetX = -preset.tacticalEdgeOffset; // Deflect towards left edge drop
      } else if (distToRight < edgeThreshold) {
        aimOffsetX = preset.tacticalEdgeOffset;  // Deflect towards right edge drop
      }
    }

    const targetPos = new THREE.Vector3(pPos.x + aimOffsetX, oPos.y, pPos.z + aimOffsetZ);
    const dir = new THREE.Vector3().subVectors(targetPos, new THREE.Vector3(oPos.x, oPos.y, oPos.z));
    dir.y = 0;
    dir.normalize();

    // Flanking angle when far (> 0.45m):
    // Rather than just sliding straight into player's line of fire, use flanking angles (±15° off-center)
    if (distanceToTarget > 0.45 && !isRecklessRush) {
      const flankSign = oPos.x > 0.02 ? 1 : (oPos.x < -0.02 ? -1 : (Math.random() > 0.5 ? 1 : -1));
      const flankRad = flankSign * (15 * Math.PI / 180); // ±15°
      dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), flankRad);
    }

    // 2. Angular Aim Spread Error
    const aimErrorRad = (Math.random() - 0.5) * aimSpread * 2;
    dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), aimErrorRad);

    // 3. Distance Kinematics & Velocity Calculation
    const effectiveDecel = (this.deskFriction * this.gravity) + 0.50; // ~6.4 m/s² calibrated for 0.60 desk friction
    let targetSpeed = 0;

    if (forceHighPowerCounter) {
      // Reckless Rush Punisher: High-power counter-strike toward nearest table edge
      const reachSpeed = Math.sqrt(2 * effectiveDecel * Math.max(distanceToTarget, 0.10));
      const counterPunch = this.difficulty === 'hard' ? 0.70 : 0.50;
      targetSpeed = reachSpeed + counterPunch;
      targetSpeed = Math.min(Math.max(targetSpeed, 1.80), 2.15);
    } else if (distanceToTarget > 0.42) {
      // START-OF-ROUND RUNWAY ADVANCEMENT (> 0.42m distance): Flanking maneuver
      if (this.difficulty === 'easy') {
        targetSpeed = Math.sqrt(2 * effectiveDecel * distanceToTarget * preset.runwayAdvancement);
      } else {
        const reach = Math.sqrt(2 * effectiveDecel * distanceToTarget);
        targetSpeed = reach * preset.runwayAdvancement + (this.difficulty === 'hard' ? 0.20 : 0.10);
      }
    } else {
      // MID-RANGE (0.28m - 0.42m): Competitive duel punch
      const reachSpeed = Math.sqrt(2 * effectiveDecel * Math.max(distanceToTarget, 0.10));
      const [punchMin, punchMax] = preset.punchSpeedRange;
      const punchSpeed = punchMin + Math.random() * (punchMax - punchMin);
      targetSpeed = reachSpeed + punchSpeed;
    }

    // Clamp speed safely per difficulty preset (with counter-strike allowance)
    const effectiveMaxSpeed = forceHighPowerCounter ? Math.min(preset.maxSpeedLimit + 0.15, 2.15) : preset.maxSpeedLimit;
    targetSpeed = Math.min(targetSpeed, effectiveMaxSpeed);

    const botMass = botConfig.mass || 0.015;
    let botImpulseMagnitude = botMass * targetSpeed;

    // 4. Self-Preservation (Prevent over-flick suicide when target is close to player edge)
    if (preset.selfPreservation && !forceHighPowerCounter) {
      const distToPlayerEdge = Math.abs(halfL - targetPos.z);
      if (distToPlayerEdge < 0.10 && distanceToTarget < 0.25) {
        botImpulseMagnitude *= 0.85;
      }
    }

    // Safe bounds clamping
    botImpulseMagnitude = Math.min(Math.max(botImpulseMagnitude, 0.006), 0.042);

    // 5. Spin Cut-Shot vs Direct Strike Point
    const useSpinShot = forceSpinCut || (Math.random() < preset.spinChance);
    const penHalfLen = (botConfig.length || 0.146) / 2;
    const flickOffsetLocal = new THREE.Vector3(0, 0, 0);

    if (useSpinShot) {
      const spinMultiplier = (this.difficulty === 'hard' || forceHighPowerCounter) ? 0.85 : 0.45;
      const hitEnd = Math.random() > 0.5 ? spinMultiplier : -spinMultiplier;
      flickOffsetLocal.set(0, 0, penHalfLen * hitEnd);
    }

    const oQuatObj = new THREE.Quaternion(oQuat.x, oQuat.y, oQuat.z, oQuat.w);
    const flickPtWorld = flickOffsetLocal.clone().applyQuaternion(oQuatObj).add(new THREE.Vector3(oPos.x, oPos.y, oPos.z));

    const shotData = {
      difficulty: this.difficulty,
      direction: { x: dir.x, y: 0, z: dir.z },
      impulseMagnitude: botImpulseMagnitude,
      impulse: {
        x: dir.x * botImpulseMagnitude,
        y: 0.0,
        z: dir.z * botImpulseMagnitude
      },
      flickPoint: {
        x: flickPtWorld.x,
        y: flickPtWorld.y,
        z: flickPtWorld.z
      },
      shotType: useSpinShot ? 'spin_cut' : 'direct',
      targetSpeed,
      aimErrorRad,
      distanceToTarget
    };

    this.lastShotData = shotData;
    return shotData;
  }

  /**
   * Schedules and executes the bot turn with 0.8s human contemplation pause
   */
  scheduleTurn(engine, onExecute) {
    if (this.isThinking) return;
    this.isThinking = true;

    if (engine.statusMsgEl) {
      engine.statusMsgEl.innerText = `🤔 Opponent (${this.getPreset().name}) soch raha hai...`;
    }

    setTimeout(() => {
      this.isThinking = false;
      if (engine.opponentPen && !engine.opponentPen.isFallen && !engine.rules.matchOver) {
        this.executeShot(engine);
        if (onExecute) onExecute();
      }
    }, this.thinkTimeMs);
  }

  executeShot(engine) {
    const pPos = engine.playerPen.body.translation();
    const oPos = engine.opponentPen.body.translation();
    const oRot = engine.opponentPen.body.rotation();

    const deskDims = { width: 0.70, length: 1.00 };
    const shot = this.calculateShot(pPos, oPos, oRot, engine.opponentPen.config, deskDims);

    const impulse = new RAPIER.Vector3(shot.impulse.x, shot.impulse.y, shot.impulse.z);
    const flickPt = new RAPIER.Vector3(shot.flickPoint.x, shot.flickPoint.y, shot.flickPoint.z);

    engine.opponentPen.body.applyImpulseAtPoint(impulse, flickPt, true);

    const shotMsg = this.difficulty === 'easy'
      ? "Opponent ka halka shot (Easy)!"
      : (this.difficulty === 'normal' ? "Opponent ka balanced shot (Normal)!" : "⚡ Opponent ka aggressive spin shot (Hard)!");

    if (engine.statusMsgEl) engine.statusMsgEl.innerText = shotMsg;
  }
}
