/**
 * D:\FInal\js\match_result.js
 * Step 3.8: Match Result Certificate & Promotion System Controller
 * 
 * Manages the School Report Card Certificate modal with 3 dynamic states:
 * 1. Victory State: Passed with Distinction, Recess Round Log, XP & Canteen Fund Rewards, Teacher Note.
 * 2. Defeat State: Table Fall Out, Detention Slip Penalty, Samosa Fine, PT Tiwari Sir warning.
 * 3. Promotion State: Official Promotion Chit, Rank Level Up, Stat Boosts, New Weapon Unlocked, Samosa Coupon.
 * 
 * Invariant: Zero physics mutation. Clean event-driven bridge to GameEngine & UI Orchestrator.
 */

(function initMatchResultController() {
  const state = {
    visible: false,
    currentView: 'victory', // 'victory' | 'defeat' | 'promotion'
    matchData: null
  };

  const DOM = {};

  function cacheDOM() {
    DOM.overlay = document.getElementById('match-result-overlay');
    if (!DOM.overlay) return false;

    // View Containers
    DOM.victoryView = document.getElementById('result-view-victory');
    DOM.defeatView = document.getElementById('result-view-defeat');
    DOM.promotionView = document.getElementById('result-view-promotion');

    // Header Meta
    DOM.benchPill = document.getElementById('result-bench-pill');
    DOM.pageNo = document.getElementById('result-page-no');
    DOM.dateStamp = document.getElementById('result-date-stamp');
    DOM.dDateStamp = document.getElementById('result-d-date-stamp');
    DOM.pDateStamp = document.getElementById('result-p-date-stamp');
    DOM.rollBadge = document.getElementById('result-roll-badge');

    // Victory Elements
    DOM.vP1Name = document.getElementById('result-v-p1-name');
    DOM.vP1Pen = document.getElementById('result-v-p1-pen');
    DOM.vP1Score = document.getElementById('result-v-p1-score');
    DOM.vP2Name = document.getElementById('result-v-p2-name');
    DOM.vP2Pen = document.getElementById('result-v-p2-pen');
    DOM.vP2Score = document.getElementById('result-v-p2-score');
    DOM.vRoundList = document.getElementById('result-v-round-list');
    DOM.vXpBonus = document.getElementById('result-v-xp-bonus');
    DOM.vRankLabel = document.getElementById('result-v-rank-label');
    DOM.vXpFill = document.getElementById('result-v-xp-fill');
    DOM.vXpText = document.getElementById('result-v-xp-text');
    DOM.vPromotionNotice = document.getElementById('result-v-promotion-notice');
    DOM.vTeacherNote = document.getElementById('result-v-teacher-note');
    DOM.vTeacherSign = document.getElementById('result-v-teacher-sign');

    // Defeat Elements
    DOM.dP1Name = document.getElementById('result-d-p1-name');
    DOM.dP1Pen = document.getElementById('result-d-p1-pen');
    DOM.dP1Score = document.getElementById('result-d-p1-score');
    DOM.dP2Name = document.getElementById('result-d-p2-name');
    DOM.dP2Pen = document.getElementById('result-d-p2-pen');
    DOM.dP2Score = document.getElementById('result-d-p2-score');
    DOM.dSurrenderMsg = document.getElementById('result-d-surrender-msg');
    DOM.dRoundList = document.getElementById('result-d-round-list');
    DOM.dTeacherNote = document.getElementById('result-d-teacher-note');

    // Promotion Elements
    DOM.pOldRank = document.getElementById('result-p-old-rank');
    DOM.pNewRank = document.getElementById('result-p-new-rank');
    DOM.pWeaponName = document.getElementById('result-p-weapon-name');
    DOM.pWeaponSub = document.getElementById('result-p-weapon-sub');

    // Button Dock
    DOM.btnNext = document.getElementById('result-btn-next');
    DOM.btnRematch = document.getElementById('result-btn-rematch');
    DOM.btnHub = document.getElementById('result-btn-hub');

    return true;
  }

  const matchResultController = {
    /**
     * Show Certificate with specified data
     */
    show: function(matchData = {}) {
      if (!cacheDOM()) return;
      state.matchData = matchData;
      state.visible = true;

      // Ensure in-game HUD hides
      if (window.hudController) {
        window.hudController.hide();
      }

      // Populate Meta
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      if (DOM.dateStamp) DOM.dateStamp.textContent = `${dd}/${mm}/98`;
      if (DOM.dDateStamp) DOM.dDateStamp.textContent = `${dd}/${mm}/98`;
      if (DOM.pDateStamp) DOM.pDateStamp.textContent = `${dd}/${mm}/98 • RECESS BELL FINAL • DESK WARS`;
      if (DOM.pageNo) DOM.pageNo.textContent = '07';

      // Load Saved Profile Data
      let saved = {};
      try { saved = JSON.parse(localStorage.getItem('penfight_save_v2') || '{}'); } catch(e) {}
      const profile = saved.profile || {};
      const progression = saved.progression || {};
      const currentStage = (window.gameEngine && window.gameEngine.currentStageId) || progression.currentStageId || 1;

      if (DOM.rollBadge) DOM.rollBadge.textContent = `#${profile.rollNo || '14'}`;
      let period = 1;
      if (currentStage >= 10) period = 4;
      else if (currentStage >= 7) period = 3;
      else if (currentStage >= 4) period = 2;
      const periodLabel = (period === 4) ? `RECESS` : `PERIOD ${period}`;
      if (DOM.benchPill) DOM.benchPill.textContent = `${periodLabel}: BENCH #${currentStage}`;

      const isWin = !!matchData.isWin;
      const isLevelUp = !!(matchData.progResult && matchData.progResult.isLevelUp);

      // Determine initial state
      if (matchData.forcePromotion) {
        this.switchView('promotion');
      } else if (isWin) {
        this.switchView('victory');
      } else {
        this.switchView('defeat');
      }

      DOM.overlay.style.display = 'flex';
      requestAnimationFrame(() => {
        DOM.overlay.classList.remove('result-dismissed');
      });
    },

    /**
     * Switch between victory, defeat, or promotion view
     */
    switchView: function(viewName) {
      if (!cacheDOM()) return;
      state.currentView = viewName;

      if (DOM.victoryView) DOM.victoryView.style.display = (viewName === 'victory') ? 'block' : 'none';
      if (DOM.defeatView) DOM.defeatView.style.display = (viewName === 'defeat') ? 'block' : 'none';
      if (DOM.promotionView) DOM.promotionView.style.display = (viewName === 'promotion') ? 'block' : 'none';

      const data = state.matchData || {};
      let saved = {};
      try { saved = JSON.parse(localStorage.getItem('penfight_save_v2') || '{}'); } catch(e) {}
      const profile = saved.profile || {};
      const progResult = data.progResult || {};

      const penDisplayNames = {
        reynolds045: 'Reynolds 045',
        nataraj621: 'Nataraj 621',
        butterflow: 'Butterflow',
        pilotV5: 'Pilot V5',
        trimax: 'Trimax Gold',
        apsaraPlatinum: 'Apsara Platinum'
      };

      const p1PenName = penDisplayNames[data.playerPen] || 'Reynolds 045';
      const p2PenName = penDisplayNames[data.opponentPen] || 'Trimax Gold';
      const p1Score = (data.score && data.score.player) || 0;
      const p2Score = (data.score && data.score.opponent) || 0;
      const oppName = data.opponentName || "Bunty 'Backbencher'";

      const is2P = (data.mode === 'pass_and_play');

      if (viewName === 'victory') {
        if (DOM.btnNext) {
          if (is2P) {
            DOM.btnNext.style.display = 'none'; // 2-Player duel has no campaign next classmate!
          } else {
            DOM.btnNext.style.display = 'flex';
            DOM.btnNext.innerHTML = `<span>NEXT CLASSMATE</span><span class="material-symbols-outlined text-[17px]">arrow_forward</span>`;
            DOM.btnNext.onclick = () => this.nextOpponent();
          }
        }
        if (DOM.btnRematch) {
          DOM.btnRematch.style.display = 'flex';
          DOM.btnRematch.innerHTML = is2P
            ? `<span class="material-symbols-outlined text-[16px] text-blue-700">refresh</span><span>REMATCH (P1 vs P2) ⚔️</span>`
            : `<span class="material-symbols-outlined text-[16px] text-blue-700">refresh</span><span>REMATCH (RETRY DUEL) 🔄</span>`;
        }
        if (DOM.btnHub) DOM.btnHub.style.display = 'flex';

        if (DOM.vP1Name) DOM.vP1Name.textContent = profile.name || (is2P ? 'Player 1' : 'Student Fighter');
        if (DOM.vP1Pen) DOM.vP1Pen.textContent = p1PenName;
        if (DOM.vP1Score) DOM.vP1Score.textContent = `${p1Score} WINS`;

        if (DOM.vP2Name) DOM.vP2Name.textContent = is2P ? 'Player 2 (Rival)' : oppName;
        if (DOM.vP2Pen) DOM.vP2Pen.textContent = p2PenName;
        if (DOM.vP2Score) DOM.vP2Score.textContent = `${p2Score} WINS`;

        // Dynamic Teacher Remark & Signature based on performance
        if (DOM.vTeacherNote && DOM.vTeacherSign) {
          if (p2Score === 0) {
            DOM.vTeacherNote.textContent = `"Remark: Exceptional wrist precision! Clean sweep without conceding a single round. Master of Desk Wars!"`;
            DOM.vTeacherSign.textContent = `— Sharma Sir (Maths & Examination Proctor)`;
          } else if (p1Score - p2Score === 1) {
            DOM.vTeacherNote.textContent = `"Remark: Sensational clutch comeback under extreme table pressure! Outstanding fighting spirit."`;
            DOM.vTeacherSign.textContent = `— Sharmila Ma'am (Class Teacher & Proctor)`;
          } else {
            DOM.vTeacherNote.textContent = `"Remark: Solid wrist flick trajectory. Keep pens safely inside geometry box during period changes!"`;
            DOM.vTeacherSign.textContent = `— Sharmila Ma'am (Class Teacher & Proctor)`;
          }
        }

        // Populate Round History List
        if (DOM.vRoundList) {
          const rounds = data.roundHistory || [
            { winner: 'player', note: 'Reynolds Direct Flick ➔ Table Fall' },
            { winner: 'player', note: 'Rebound Clash ➔ Spin Glider' },
            { winner: 'opponent', note: 'Edge Balance Check ➔ Quick Tap' },
            { winner: 'player', note: '68% Duel Rocket ➔ Teak Knockout!' }
          ];

          DOM.vRoundList.innerHTML = rounds.map((r, i) => {
            const isRoundWin = (r === 'player' || (r && r.winner === 'player'));
            const noteText = (r && r.note) || (isRoundWin ? 'Tactical Flick ➔ Boundary Fall' : 'Edge Slip ➔ Counter Knock');
            const badgeClass = isRoundWin ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-slate-100 text-slate-600 border-slate-300';
            const badgeText = isRoundWin ? 'WIN' : 'LOSS';
            return `
              <div class="flex items-center justify-between text-[11px] py-1 border-b border-dashed border-slate-300">
                <span class="font-bold text-slate-800">R${i + 1}: ${noteText}</span>
                <span class="px-2 py-0.2 rounded font-black text-[9px] border ${badgeClass}" style="font-family: 'Permanent Marker', cursive;">${badgeText}</span>
              </div>
            `;
          }).join('');
        }

        const earnedXp = progResult.earnedXp || 350;
        if (DOM.vXpBonus) DOM.vXpBonus.textContent = `+${earnedXp} XP`;

        if (progResult.levelInfo && DOM.vRankLabel) {
          DOM.vRankLabel.textContent = `Rank: ${progResult.levelInfo.title}`;
        }
        if (DOM.vXpFill) DOM.vXpFill.style.width = '100%';

        // Level Up notice pill
        if (DOM.vPromotionNotice) {
          DOM.vPromotionNotice.style.display = progResult.isLevelUp ? 'flex' : 'none';
        }
      } else if (viewName === 'defeat') {
        if (DOM.btnNext) DOM.btnNext.style.display = 'none';
        if (DOM.btnRematch) {
          DOM.btnRematch.style.display = 'flex';
          DOM.btnRematch.innerHTML = is2P
            ? `<span class="material-symbols-outlined text-[16px] text-rose-700">swords</span><span>REMATCH (P1 vs P2) ⚔️</span>`
            : `<span class="material-symbols-outlined text-[16px] text-rose-700">swords</span><span>REMATCH! RECLAIM BENCH ⚔️</span>`;
        }
        if (DOM.btnHub) DOM.btnHub.style.display = 'flex';

        if (DOM.dP1Name) DOM.dP1Name.textContent = profile.name || (is2P ? 'Player 1' : 'Student Fighter');
        if (DOM.dP1Pen) DOM.dP1Pen.textContent = p1PenName;
        if (DOM.dP1Score) DOM.dP1Score.textContent = `${p1Score} WINS`;

        if (DOM.dP2Name) DOM.dP2Name.textContent = is2P ? 'Player 2 (Rival)' : oppName;
        if (DOM.dP2Pen) DOM.dP2Pen.textContent = p2PenName;
        if (DOM.dP2Score) DOM.dP2Score.textContent = `${p2Score} WINS`;

        if (DOM.dSurrenderMsg) {
          DOM.dSurrenderMsg.textContent = is2P
            ? `BENCH CLAIMED BY PLAYER 2`
            : `BENCH SURRENDERED TO ${oppName.toUpperCase()}`;
        }

        if (DOM.dTeacherNote) {
          if (p1Score === 0) {
            DOM.dTeacherNote.textContent = `"Remark: Table se pen neeche gira diya! Agle recess tak zero duel permission! Murga bano corridor me!"`;
          } else {
            DOM.dTeacherNote.textContent = `"Remark: Close match but lost bench grip! Work on table edge deflection angles before next recess."`;
          }
        }

        if (DOM.dRoundList) {
          DOM.dRoundList.innerHTML = `
            <div class="flex items-center justify-between text-[11px] py-1 border-b border-dashed border-slate-300">
              <span class="font-bold text-slate-800">R1: Corner Trap Defense</span>
              <span class="px-2 py-0.2 rounded font-black text-[9px] border bg-slate-100 text-slate-600 border-slate-300">LOSS</span>
            </div>
            <div class="flex items-center justify-between text-[11px] py-1 border-b border-dashed border-slate-300">
              <span class="font-bold text-slate-800">R2: Table Edge Balance Slip</span>
              <span class="px-2 py-0.2 rounded font-black text-[9px] border bg-rose-100 text-rose-800 border-rose-300">OUT</span>
            </div>
          `;
        }
      } else if (viewName === 'promotion') {
        if (DOM.btnNext) {
          DOM.btnNext.style.display = 'flex';
          DOM.btnNext.innerHTML = `<span>CLAIM ARSENAL REWARD & ADVANCE</span><span class="material-symbols-outlined text-[17px]">military_tech</span>`;
          DOM.btnNext.onclick = () => {
            if (window.showCompassBox) {
              window.matchResultController.hide();
              setTimeout(() => window.showCompassBox(), 150);
            } else {
              this.returnToHub();
            }
          };
        }
        if (DOM.btnRematch) DOM.btnRematch.style.display = 'none';
        if (DOM.btnHub) DOM.btnHub.style.display = 'flex';

        const lvl = (progResult.levelInfo) || { level: 2, title: 'Middle Row Rival' };
        if (DOM.pNewRank) DOM.pNewRank.textContent = `🎖️ ${lvl.title.toUpperCase()} 🎖️`;
        if (DOM.pOldRank) DOM.pOldRank.textContent = `Naya Admission (Lvl ${Math.max(1, lvl.level - 1)})`;
        if (DOM.pWeaponName) DOM.pWeaponName.textContent = 'Cello Gripper 0.5mm';
      }
    },

    /**
     * Hide certificate modal
     */
    hide: function() {
      if (!DOM.overlay) cacheDOM();
      if (!DOM.overlay) return;
      DOM.overlay.classList.add('result-dismissed');
      setTimeout(() => {
        DOM.overlay.style.display = 'none';
        state.visible = false;
      }, 300);
    },

    /**
     * Rematch action
     */
    rematch: function() {
      this.hide();
      setTimeout(() => {
        if (window.gameEngine) {
          window.gameEngine.resetSandbox();
        }
        if (window.hudController) {
          window.hudController.show();
          window.hudController.updateScore(0, 0, 3);
          window.hudController.setTurn('P1');
        }
      }, 150);
    },

    /**
     * Next Opponent / Stage action (Stay in Arena for Next Bench)
     */
    nextOpponent: function() {
      this.hide();
      setTimeout(() => {
        let saved = {};
        try { saved = JSON.parse(localStorage.getItem('penfight_save_v2') || '{}'); } catch(e) {}
        const progression = saved.progression || {};
        const currentStage = (window.gameEngine && window.gameEngine.currentStageId) || progression.currentStageId || 1;
        
        if (currentStage >= 11) {
          if (window.showCampaignMap) window.showCampaignMap();
          else if (window.showMainMenu) window.showMainMenu();
          return;
        }

        const nextStage = currentStage + 1;
        if (typeof window.launchStageMatch === 'function') {
          window.launchStageMatch(nextStage);
        } else if (window.showCampaignMap) {
          window.showCampaignMap();
        }
      }, 150);
    },

    /**
     * Return to Main Menu Hub
     */
    returnToHub: function() {
      this.hide();
      setTimeout(() => {
        if (window.showMainMenu) {
          window.showMainMenu();
        }
      }, 150);
    }
  };

  // Expose global controller
  window.matchResultController = matchResultController;
})();
