/**
 * D:\FInal\js\hud.js
 * Step 3.7: Live 3D Arena - Slingshot HUD & Pause Modal Controller
 * 
 * Standalone controller for in-game overlay, power meter, turn notifications,
 * round scoreboard, and pause drawer dialog.
 * 
 * Invariant: Zero direct mutation of 3D physics or index.html. Decoupled and event-driven.
 */

(function initHUDController() {
  // Internal State
  const state = {
    visible: false,
    isPaused: false,
    currentTurn: 'P1', // 'P1' | 'P2' | 'BOT'
    powerPercent: 0,
    aimLocked: false,
    spinGrip: false,
    p1Score: 0,
    p2Score: 0,
    maxRounds: 3,
    timerSeconds: 165, // 02:45 default
    timerInterval: null,
    sfxEnabled: true,
    hapticsEnabled: true,
    listeners: {}
  };

  // Cached DOM elements
  const DOM = {
    hudOverlay: null,
    pauseModal: null,
    p1Name: null,
    p1Pen: null,
    p1Roll: null,
    p1Avatar: null,
    p1Pips: null,
    p2Name: null,
    p2Pen: null,
    p2Roll: null,
    p2Avatar: null,
    p2Pips: null,
    roundLabel: null,
    matchTimer: null,
    recessPill: null,
    stakeBadge: null,
    turnBanner: null,
    turnTitle: null,
    turnSub: null,
    turnStamp: null,
    powerCard: null,
    powerBarFill: null,
    powerBadge: null,
    powerZoneLabel: null,
    aimBtn: null,
    flickCta: null,
    spinBtn: null,
    pauseBtn: null,
    pauseResumeBtn: null,
    pauseRestartBtn: null,
    pauseQuitBtn: null,
    pauseSfxToggle: null,
    pauseHapticToggle: null,
    pauseScoreSummary: null,
    pauseRoundSummary: null,
    pauseP1Summary: null,
    pauseP2Summary: null,
    pauseP1PenSummary: null,
    pauseP2PenSummary: null
  };

  function cacheDOMElements() {
    DOM.hudOverlay = document.getElementById('game-hud-overlay');
    DOM.pauseModal = document.getElementById('pause-menu-modal');
    if (!DOM.hudOverlay) return false;

    DOM.p1Name = document.getElementById('hud-p1-name');
    DOM.p1Pen = document.getElementById('hud-p1-pen');
    DOM.p1Roll = document.getElementById('hud-p1-roll');
    DOM.p1Avatar = document.getElementById('hud-p1-avatar');
    DOM.p1Pips = document.getElementById('hud-p1-pips');

    DOM.p2Name = document.getElementById('hud-p2-name');
    DOM.p2Pen = document.getElementById('hud-p2-pen');
    DOM.p2Roll = document.getElementById('hud-p2-roll');
    DOM.p2Avatar = document.getElementById('hud-p2-avatar');
    DOM.p2Pips = document.getElementById('hud-p2-pips');

    DOM.roundLabel = document.getElementById('hud-round-label');
    DOM.matchTimer = document.getElementById('hud-match-timer');
    DOM.recessPill = document.getElementById('hud-recess-pill');
    DOM.stakeBadge = document.getElementById('hud-stake-badge');

    DOM.turnBanner = document.getElementById('hud-turn-banner');
    DOM.turnTitle = document.getElementById('hud-turn-title');
    DOM.turnSub = document.getElementById('hud-turn-sub');
    DOM.turnStamp = document.getElementById('hud-turn-stamp');
    DOM.p1TurnPill = document.getElementById('hud-p1-turn-pill');
    DOM.p2TurnPill = document.getElementById('hud-p2-turn-pill');
    DOM.p2TurnText = document.getElementById('hud-p2-turn-text');

    DOM.powerCard = document.getElementById('hud-power-card');
    DOM.powerBarFill = document.getElementById('hud-power-bar-fill');
    DOM.powerBadge = document.getElementById('hud-power-badge');
    DOM.powerZoneLabel = document.getElementById('hud-power-zone-label');

    DOM.aimBtn = document.getElementById('hud-aim-btn');
    DOM.flickCta = document.getElementById('hud-flick-cta');
    DOM.spinBtn = document.getElementById('hud-spin-btn');
    DOM.pauseBtn = document.getElementById('hud-pause-btn');

    if (DOM.pauseModal) {
      DOM.pauseResumeBtn = document.getElementById('pause-resume-btn');
      DOM.pauseRestartBtn = document.getElementById('pause-restart-btn');
      DOM.pauseQuitBtn = document.getElementById('pause-quit-btn');
      DOM.pauseSfxToggle = document.getElementById('pause-sfx-toggle');
      DOM.pauseHapticToggle = document.getElementById('pause-haptic-toggle');
      DOM.pauseScoreSummary = document.getElementById('pause-score-summary');
      DOM.pauseRoundSummary = document.getElementById('pause-round-summary');
      DOM.pauseP1Summary = document.getElementById('pause-p1-summary');
      DOM.pauseP2Summary = document.getElementById('pause-p2-summary');
      DOM.pauseP1PenSummary = document.getElementById('pause-p1-pen-summary');
      DOM.pauseP2PenSummary = document.getElementById('pause-p2-pen-summary');
    }

    return true;
  }

  function emit(eventName, data) {
    if (state.listeners[eventName]) {
      state.listeners[eventName].forEach(fn => {
        try { fn(data); } catch (e) { console.error(`Error in HUD event [${eventName}]:`, e); }
      });
    }
  }

  // Controller Implementation
  const hudController = {
    /**
     * Show the in-game HUD overlay
     */
    show: function() {
      cacheDOMElements();
      if (!DOM.hudOverlay) return;
      DOM.hudOverlay.style.display = 'flex';
      state.visible = true;
      hudController.hydrateFromSave();
      hudController.startTimer();
      emit('show');
    },

    /**
     * Hide the in-game HUD overlay
     */
    hide: function() {
      if (!DOM.hudOverlay) cacheDOMElements();
      if (DOM.hudOverlay) {
        DOM.hudOverlay.style.display = 'none';
      }
      if (DOM.pauseModal) {
        DOM.pauseModal.classList.remove('pause-modal-open');
        DOM.pauseModal.style.display = 'none';
      }
      state.visible = false;
      hudController.stopTimer();
      emit('hide');
    },

    /**
     * Check if match is currently paused
     */
    isPaused: function() {
      return state.isPaused;
    },

    /**
     * Explicitly set pause state (e.g. for modal drawers like Career Dossier)
     */
    setPaused: function(paused) {
      state.isPaused = !!paused;
    },

    /**
     * Check if HUD is currently visible
     */
    isVisible: function() {
      return state.visible;
    },

    /**
     * Update Slingshot Tension Power (0 to 100%)
     * Dynamically shifts color gradient, updates labels and glow effects
     */
    updatePower: function(percent) {
      if (!DOM.powerBarFill) cacheDOMElements();
      const clamped = Math.max(0, Math.min(100, Math.round(percent)));
      state.powerPercent = clamped;

      if (DOM.powerBarFill) {
        DOM.powerBarFill.style.width = `${clamped}%`;
      }

      if (DOM.powerBadge) {
        let label = '0% (PULL TO AIM)';
        if (clamped > 85) {
          label = `${clamped}% (ROCKET BLAST! 🔥)`;
        } else if (clamped > 60) {
          label = `${clamped}% (DUEL PUNCH! ⚡)`;
        } else if (clamped > 30) {
          label = `${clamped}% (BALANCED FLICK)`;
        } else if (clamped > 0) {
          label = `${clamped}% (LIGHT TOSS)`;
        }
        DOM.powerBadge.textContent = label;
      }

      if (DOM.powerZoneLabel) {
        if (clamped >= 80) {
          DOM.powerZoneLabel.textContent = 'HIGH RISK KNOCKOUT!';
          DOM.powerZoneLabel.className = 'text-rose-700 font-black uppercase animate-pulse';
        } else if (clamped >= 40) {
          DOM.powerZoneLabel.textContent = 'SWEET REBOUND ZONE';
          DOM.powerZoneLabel.className = 'text-amber-800 font-black uppercase';
        } else {
          DOM.powerZoneLabel.textContent = 'TARGET TENSION ZONE';
          DOM.powerZoneLabel.className = 'text-slate-600 font-bold uppercase';
        }
      }

      if (DOM.powerCard) {
        if (clamped >= 80) {
          DOM.powerCard.classList.add('power-overdrive');
        } else {
          DOM.powerCard.classList.remove('power-overdrive');
        }
      }

      emit('powerChange', clamped);
    },

    /**
     * Update Active Turn Notification
     * @param {'P1'|'P2'|'BOT'} turn
     */
    setTurn: function(turn) {
      state.currentTurn = turn;
      if (!DOM.turnBanner) cacheDOMElements();

      // Keep center desk area clean and unobstructed during normal play
      if (DOM.turnBanner) {
        DOM.turnBanner.style.display = 'none';
      }

      if (turn === 'P1') {
        if (DOM.p1TurnPill) {
          DOM.p1TurnPill.classList.remove('hidden');
          DOM.p1TurnPill.classList.add('flex');
        }
        if (DOM.p2TurnPill) {
          DOM.p2TurnPill.classList.add('hidden');
          DOM.p2TurnPill.classList.remove('flex');
        }
        if (DOM.flickCta) {
          DOM.flickCta.classList.remove('opacity-60', 'cursor-not-allowed');
          DOM.flickCta.disabled = false;
        }
      } else {
        const isBot = (turn === 'BOT');
        if (DOM.p1TurnPill) {
          DOM.p1TurnPill.classList.add('hidden');
          DOM.p1TurnPill.classList.remove('flex');
        }
        if (DOM.p2TurnPill) {
          DOM.p2TurnPill.classList.remove('hidden');
          DOM.p2TurnPill.classList.add('flex');
          if (DOM.p2TurnText) {
            DOM.p2TurnText.textContent = isBot ? 'RIVAL TURN ⏳' : 'PLAYER 2 TURN 🎯';
          }
        }
        if (DOM.flickCta && isBot) {
          DOM.flickCta.classList.add('opacity-60', 'cursor-not-allowed');
          DOM.flickCta.disabled = true;
        }
      }

      emit('turnChange', turn);
    },

    /**
     * Update Scores and Best-of-3/5 round pips
     */
    updateScore: function(p1Score, p2Score, maxRounds = 3) {
      state.p1Score = p1Score;
      state.p2Score = p2Score;
      state.maxRounds = maxRounds;
      if (!DOM.roundLabel) cacheDOMElements();

      const currentRoundNum = Math.min(maxRounds, p1Score + p2Score + 1);
      if (DOM.roundLabel) {
        DOM.roundLabel.textContent = `ROUND 0${currentRoundNum} / 0${maxRounds}`;
      }

      // Update P1 Pips
      if (DOM.p1Pips) {
        const pips = DOM.p1Pips.querySelectorAll('[data-pip]');
        pips.forEach((pip, idx) => {
          pip.className = 'w-2.5 h-2.5 rounded-full border transition-all';
          if (idx < p1Score) {
            pip.classList.add('round-pip-won');
          } else if (idx < p1Score + p2Score) {
            pip.classList.add('round-pip-lost');
          } else {
            pip.classList.add('round-pip-pending');
          }
        });
      }

      // Update P2 Pips
      if (DOM.p2Pips) {
        const pips = DOM.p2Pips.querySelectorAll('[data-pip]');
        pips.forEach((pip, idx) => {
          pip.className = 'w-2.5 h-2.5 rounded-full border transition-all';
          if (idx < p2Score) {
            pip.classList.add('round-pip-won');
          } else if (idx < p1Score + p2Score) {
            pip.classList.add('round-pip-lost');
          } else {
            pip.classList.add('round-pip-pending');
          }
        });
      }

      // Sync Pause Modal summary
      if (DOM.pauseScoreSummary) {
        DOM.pauseScoreSummary.textContent = `${p1Score} - ${p2Score}`;
      }
      if (DOM.pauseRoundSummary) {
        DOM.pauseRoundSummary.textContent = `ROUND ${currentRoundNum}/${maxRounds}`;
      }

      emit('scoreChange', { p1Score, p2Score, currentRound: currentRoundNum, maxRounds });
    },

    /**
     * Configure Match Participants
     */
    setPlayers: function(p1, p2) {
      cacheDOMElements();
      if (p1) {
        if (p1.name && DOM.p1Name) DOM.p1Name.textContent = p1.name;
        if (p1.pen && DOM.p1Pen) DOM.p1Pen.textContent = p1.pen.toUpperCase();
        if (p1.roll && DOM.p1Roll) DOM.p1Roll.textContent = `R#${p1.roll}`;
        if (p1.avatar && DOM.p1Avatar) DOM.p1Avatar.src = p1.avatar;
        if (p1.name && DOM.pauseP1Summary) DOM.pauseP1Summary.textContent = p1.name;
        if (p1.pen && DOM.pauseP1PenSummary) DOM.pauseP1PenSummary.textContent = p1.pen;
      }
      if (p2) {
        if (p2.name && DOM.p2Name) DOM.p2Name.textContent = p2.name;
        if (p2.pen && DOM.p2Pen) DOM.p2Pen.textContent = p2.pen.toUpperCase();
        if (p2.roll && DOM.p2Roll) DOM.p2Roll.textContent = `R#${p2.roll}`;
        if (p2.avatar && DOM.p2Avatar) DOM.p2Avatar.src = p2.avatar;
        if (p2.name && DOM.pauseP2Summary) DOM.pauseP2Summary.textContent = p2.name;
        if (p2.pen && DOM.pauseP2PenSummary) DOM.pauseP2PenSummary.textContent = p2.pen;
      }
    },

    /**
     * Show custom animated referee banner (e.g. KNOCKOUT, TABLE FOUL)
     */
    setBanner: function(title, sub, stamp, durationMs = 2400) {
      if (!DOM.turnBanner) cacheDOMElements();
      if (!DOM.turnBanner) return;

      if (title && DOM.turnTitle) DOM.turnTitle.textContent = title;
      if (sub && DOM.turnSub) DOM.turnSub.textContent = sub;
      if (stamp && DOM.turnStamp) {
        DOM.turnStamp.innerHTML = `<span class="text-[9px] font-black uppercase tracking-wider">${stamp}</span>`;
      }

      // Show center referee banner on demand
      DOM.turnBanner.style.display = 'block';
      DOM.turnBanner.style.animation = 'none';
      void DOM.turnBanner.offsetWidth;
      DOM.turnBanner.style.animation = 'hudBannerPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

      if (durationMs > 0) {
        if (state._bannerTimer) clearTimeout(state._bannerTimer);
        state._bannerTimer = setTimeout(() => {
          if (DOM.turnBanner) {
            DOM.turnBanner.style.display = 'none';
          }
          hudController.setTurn(state.currentTurn);
        }, durationMs);
      }
    },

    /**
     * Open Pause Drawer Dialog
     */
    openPauseModal: function() {
      cacheDOMElements();
      if (!DOM.pauseModal) return;
      state.isPaused = true;
      DOM.pauseModal.style.display = 'flex';
      requestAnimationFrame(() => {
        DOM.pauseModal.classList.add('pause-modal-open');
      });
      emit('pause');
    },

    /**
     * Close Pause Drawer Dialog
     */
    closePauseModal: function() {
      if (!DOM.pauseModal) cacheDOMElements();
      if (!DOM.pauseModal) return;
      DOM.pauseModal.classList.remove('pause-modal-open');
      setTimeout(() => {
        if (!DOM.pauseModal.classList.contains('pause-modal-open')) {
          DOM.pauseModal.style.display = 'none';
        }
      }, 260);
      state.isPaused = false;
      emit('resume');
    },

    /**
     * Match Timer Countdown Management
     */
    startTimer: function(totalSeconds = 165) {
      state.timerSeconds = totalSeconds;
      hudController.stopTimer();

      state.timerInterval = setInterval(() => {
        if (state.isPaused) return;
        if (state.timerSeconds > 0) {
          state.timerSeconds--;
          const mins = Math.floor(state.timerSeconds / 60);
          const secs = state.timerSeconds % 60;
          if (DOM.matchTimer) {
            DOM.matchTimer.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
          }
        } else {
          // Timer reached 00:00 - Sudden Death or Time Out
          hudController.setBanner("TIME'S UP! 🔔", "Period Bell ringing! Sudden death sudden flick!", "SUDDEN DEATH ⚡", 4000);
          emit('timeUp');
        }
      }, 1000);
    },

    stopTimer: function() {
      if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
      }
    },

    /**
     * Hydrate values from localStorage (penfight_save_v2)
     */
    hydrateFromSave: function() {
      try {
        const raw = localStorage.getItem('penfight_save_v2');
        if (!raw) return;
        const save = JSON.parse(raw);
        const profile = save.profile || {};
        const stage = (save.progression && save.progression.currentStageId) || 1;

        if (DOM.recessPill) {
          DOM.recessPill.textContent = `RECESS PERIOD 4 • BENCH #${stage}`;
        }

        const penNames = {
          reynolds045: 'REYNOLDS 045',
          nataraj621: 'NATARAJ 621',
          butterflow: 'BUTTERFLOW',
          pilotV5: 'PILOT V5',
          trimax: 'TRIMAX GOLD',
          apsaraPlatinum: 'APSARA PLATINUM'
        };

        const avatarPath = profile.avatarCustom || (profile.avatar === 'girl' ? './assets/student_avatar_girl.jpg' : './assets/student_avatar.jpg');

        hudController.setPlayers({
          name: profile.name || 'Student Fighter',
          pen: penNames[profile.selectedPlayerPen] || 'REYNOLDS 045',
          roll: profile.rollNo || '14',
          avatar: avatarPath
        });
      } catch (e) {
        console.warn('HUD failed to hydrate from save:', e);
      }
    },

    /**
     * Subscribe to HUD events
     * @param {'pause'|'resume'|'restart'|'quit'|'flick'|'aimLock'|'spinGrip'|'soundToggle'} event
     * @param {Function} callback
     */
    on: function(event, callback) {
      if (!state.listeners[event]) state.listeners[event] = [];
      state.listeners[event].push(callback);
    }
  };

  // Wire UI Listeners once DOM is ready
  function bindEventListeners() {
    if (!cacheDOMElements()) return;

    if (DOM.pauseBtn) {
      DOM.pauseBtn.addEventListener('click', () => hudController.openPauseModal());
    }
    if (DOM.pauseResumeBtn) {
      DOM.pauseResumeBtn.addEventListener('click', () => hudController.closePauseModal());
    }
    if (DOM.pauseRestartBtn) {
      DOM.pauseRestartBtn.addEventListener('click', () => {
        hudController.closePauseModal();
        hudController.updateScore(0, 0, state.maxRounds);
        hudController.startTimer(165);
        emit('restart');
      });
    }
    if (DOM.pauseQuitBtn) {
      DOM.pauseQuitBtn.addEventListener('click', () => {
        hudController.closePauseModal();
        hudController.hide();
        emit('quit');
      });
    }

    // Sound Toggle
    if (DOM.pauseSfxToggle) {
      DOM.pauseSfxToggle.addEventListener('click', function() {
        const isCurrentlyOn = this.getAttribute('data-state') === 'on';
        const newState = isCurrentlyOn ? 'off' : 'on';
        this.setAttribute('data-state', newState);
        state.sfxEnabled = !isCurrentlyOn;
        emit('soundToggle', state.sfxEnabled);
      });
    }

    // Haptics Toggle
    if (DOM.pauseHapticToggle) {
      DOM.pauseHapticToggle.addEventListener('click', function() {
        const isCurrentlyOn = this.getAttribute('data-state') === 'on';
        const newState = isCurrentlyOn ? 'off' : 'on';
        this.setAttribute('data-state', newState);
        state.hapticsEnabled = !isCurrentlyOn;
        emit('hapticToggle', state.hapticsEnabled);
      });
    }

    // Aim Lock Button
    if (DOM.aimBtn) {
      DOM.aimBtn.addEventListener('click', function() {
        state.aimLocked = !state.aimLocked;
        this.classList.toggle('aim-locked', state.aimLocked);
        emit('aimLock', state.aimLocked);
      });
    }

    // Spin Grip Button
    if (DOM.spinBtn) {
      DOM.spinBtn.addEventListener('click', function() {
        state.spinGrip = !state.spinGrip;
        this.classList.toggle('spin-active', state.spinGrip);
        emit('spinGrip', state.spinGrip);
      });
    }

    // Hero Flick CTA (Manual fire trigger fallback)
    if (DOM.flickCta) {
      DOM.flickCta.addEventListener('click', function() {
        if (state.currentTurn === 'P1') {
          emit('flick', { power: state.powerPercent });
        }
      });
    }
  }

  // Auto-init on DOMContentLoaded or immediate if already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindEventListeners);
  } else {
    bindEventListeners();
  }

  // Expose global controller
  window.hudController = hudController;
})();
