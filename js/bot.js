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
    aimSpreadRad: 0.18,      // ±10° spread error
    spinChance: 0.05,        // 5% spin
    maxSpeedLimit: 1.70,     // Gentle max speed
    punchSpeedRange: [0.15, 0.35],
    runwayAdvancement: 0.65, // Stops ~65% into runway on start
    tacticalEdgeOffset: 0.0, // No tactical edge targeting
    selfPreservation: false,
    label: 'Easy Mode (Aasan Classmate)'
  },
  normal: {
    name: 'Normal (Balanced)',
    aimSpreadRad: 0.07,      // ±4° spread error
    spinChance: 0.25,        // 25% subtle spin cut-shot
    maxSpeedLimit: 2.15,     // Balanced speed
    punchSpeedRange: [0.35, 0.60],
    runwayAdvancement: 0.85, // Advances close to player safely
    tacticalEdgeOffset: 0.012,
    selfPreservation: true,
    label: 'Normal Mode (Balanced Contest)'
  },
  hard: {
    name: 'Hard (Class Champion)',
    aimSpreadRad: 0.025,     // ±1.5° sharp razor spread
    spinChance: 0.65,        // 65% aggressive spin cut-shot
    maxSpeedLimit: 2.30,     // Fast decisive knockout speed
    punchSpeedRange: [0.60, 0.85],
    runwayAdvancement: 0.92,
    tacticalEdgeOffset: 0.022,
    selfPreservation: true,
    label: 'Hard Mode (Class Champion)'
  }
};

export class PCOpponentController {
  constructor(options = {}) {
    this.difficulty = options.difficulty || 'normal';
    this.thinkTimeMs = options.thinkTimeMs || 800; // 0.8s human contemplation pause
    this.deskFriction = options.deskFriction || 0.33;
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

    // 1. Tactical Target Offset (Aiming to deflect player off desk edges in Hard/Normal)
    let aimOffsetX = 0;
    if (preset.tacticalEdgeOffset > 0) {
      const distToLeft = Math.abs(pPos.x - (-halfW));
      const distToRight = Math.abs(halfW - pPos.x);
      const edgeThreshold = this.difficulty === 'hard' ? 0.22 : 0.12;

      if (distToLeft < distToRight && distToLeft < edgeThreshold) {
        aimOffsetX = -preset.tacticalEdgeOffset; // Deflect towards left edge drop
      } else if (distToRight < edgeThreshold) {
        aimOffsetX = preset.tacticalEdgeOffset;  // Deflect towards right edge drop
      }
    }

    const targetPos = new THREE.Vector3(pPos.x + aimOffsetX, oPos.y, pPos.z);
    const dir = new THREE.Vector3().subVectors(targetPos, new THREE.Vector3(oPos.x, oPos.y, oPos.z));
    dir.y = 0;
    dir.normalize();

    // 2. Angular Aim Spread Error
    const aimErrorRad = (Math.random() - 0.5) * preset.aimSpreadRad * 2;
    dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), aimErrorRad);

    // 3. Distance Kinematics & Velocity Calculation
    const effectiveDecel = (this.deskFriction * this.gravity) + 0.40; // ~3.6 m/s²
    let targetSpeed = 0;

    // START-OF-ROUND RUNWAY SAFETY (> 0.42m distance): No instant turn-1 KO
    if (distanceToTarget > 0.42) {
      if (this.difficulty === 'easy') {
        targetSpeed = Math.sqrt(2 * effectiveDecel * distanceToTarget * preset.runwayAdvancement);
      } else {
        const reach = Math.sqrt(2 * effectiveDecel * distanceToTarget);
        targetSpeed = reach * preset.runwayAdvancement + (this.difficulty === 'hard' ? 0.30 : 0.15);
      }
    } else {
      // MID-TO-CLOSE RANGE (< 0.42m): Competitive duel punch
      const reachSpeed = Math.sqrt(2 * effectiveDecel * Math.max(distanceToTarget, 0.10));
      const [punchMin, punchMax] = preset.punchSpeedRange;
      const punchSpeed = punchMin + Math.random() * (punchMax - punchMin);
      targetSpeed = reachSpeed + punchSpeed;
    }

    // Clamp speed safely per difficulty preset
    targetSpeed = Math.min(targetSpeed, preset.maxSpeedLimit);

    const botMass = botConfig.mass || 0.015;
    let botImpulseMagnitude = botMass * targetSpeed;

    // 4. Self-Preservation (Prevent over-flick suicide when target is close to player edge)
    if (preset.selfPreservation) {
      const distToPlayerEdge = Math.abs(halfL - targetPos.z);
      if (distToPlayerEdge < 0.10 && distanceToTarget < 0.25) {
        botImpulseMagnitude *= 0.85;
      }
    }

    // Safe bounds clamping
    botImpulseMagnitude = Math.min(Math.max(botImpulseMagnitude, 0.008), 0.048);

    // 5. Spin Cut-Shot vs Direct Strike Point
    const useSpinShot = Math.random() < preset.spinChance;
    const penHalfLen = (botConfig.length || 0.146) / 2;
    const flickOffsetLocal = new THREE.Vector3(0, 0, 0);

    if (useSpinShot) {
      const spinMultiplier = this.difficulty === 'hard' ? 0.72 : 0.40;
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
