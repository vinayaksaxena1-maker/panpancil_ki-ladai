/**
 * js/rules.js - Match Rules & Turn State Machine
 * Phase 2, Step 2.1
 * 
 * Invariants:
 * - Best of 5 Rounds (First to 3 Round Wins)
 * - Strict Turn Flow: P1_AIMING -> SIMULATING -> SETTLING -> ROUND_OUTCOME -> NEXT_TURN / ROUND_RESET / MATCH_OVER
 * - Double Drop = Draw & Re-flick (no point awarded)
 * - Edge Survival = Turn Passes to opponent
 * - Safe reset between rounds keeping match score intact
 */

export const MatchState = {
  IDLE: 'IDLE',
  P1_AIMING: 'P1_AIMING',
  OPPONENT_AIMING: 'OPPONENT_AIMING',
  SIMULATING: 'SIMULATING',
  SETTLING: 'SETTLING',
  ROUND_OUTCOME: 'ROUND_OUTCOME',
  ROUND_RESET: 'ROUND_RESET',
  MATCH_OVER: 'MATCH_OVER'
};

export class MatchRules {
  constructor(options = {}) {
    this.targetWins = options.targetWins || 3; // First to 3 wins (Best of 5)
    this.mode = options.mode || 'bot'; // 'bot' | 'pass_and_play'
    
    this.state = MatchState.IDLE;
    this.activeTurn = 'player'; // 'player' | 'opponent'
    
    this.score = {
      player: 0,
      opponent: 0
    };
    
    this.currentRound = 1;
    this.totalRoundsPlayed = 0;
    this.roundHistory = [];
    this.matchOver = false;
    this.winner = null;

    // Callbacks
    this.onStateChange = options.onStateChange || null;
    this.onScoreUpdate = options.onScoreUpdate || null;
    this.onRoundComplete = options.onRoundComplete || null;
    this.onMatchComplete = options.onMatchComplete || null;
  }

  startMatch(mode = 'bot') {
    this.mode = mode;
    this.score = { player: 0, opponent: 0 };
    this.currentRound = 1;
    this.totalRoundsPlayed = 0;
    this.roundHistory = [];
    this.matchOver = false;
    this.winner = null;
    this.activeTurn = 'player';
    
    this.setState(MatchState.P1_AIMING);
    if (this.onScoreUpdate) {
      this.onScoreUpdate(this.score.player, this.score.opponent, this.currentRound);
    }
  }

  setState(newState, payload = {}) {
    this.state = newState;
    if (this.onStateChange) {
      this.onStateChange(this.state, payload);
    }
  }

  onFlickExecuted(flicker = 'player') {
    this.setState(MatchState.SIMULATING, { flicker });
  }

  onSettlingStarted() {
    this.setState(MatchState.SETTLING);
  }

  /**
   * Evaluate turn outcome when pens have settled
   * @param {boolean} playerFallen
   * @param {boolean} opponentFallen
   * @returns {object} outcome details
   */
  evaluateTurnOutcome(playerFallen, opponentFallen) {
    this.setState(MatchState.ROUND_OUTCOME);

    // Case 1: Double Drop (Re-flick / Draw)
    if (playerFallen && opponentFallen) {
      const result = {
        type: 'DRAW_REFLICK',
        winner: null,
        message: '⚖️ Dono pens desk se bahar! Round Draw! Re-flick!',
        score: { ...this.score },
        currentRound: this.currentRound,
        reFlick: true,
        matchOver: false
      };
      if (this.onRoundComplete) this.onRoundComplete(result);
      return result;
    }

    const p1Label = this.mode === 'pass_and_play' ? 'Player 1' : 'Player';
    const p2Label = this.mode === 'pass_and_play' ? 'Player 2' : 'Opponent';

    // Case 2: Opponent Knocked Out (Player wins round)
    if (opponentFallen && !playerFallen) {
      this.score.player++;
      this.totalRoundsPlayed++;
      
      const isMatchWin = this.score.player >= this.targetWins;
      if (isMatchWin) {
        this.matchOver = true;
        this.winner = 'player';
        this.setState(MatchState.MATCH_OVER, { winner: 'player' });
      }

      const result = {
        type: isMatchWin ? 'MATCH_WIN_PLAYER' : 'ROUND_WIN_PLAYER',
        winner: 'player',
        message: isMatchWin 
          ? `🏆 MATCH JEET GAYE! ${p1Label} Wins ${this.score.player} - ${this.score.opponent}!` 
          : `🎉 Round ${this.currentRound} ${p1Label} ne jeeta! [${this.score.player} - ${this.score.opponent}]`,
        score: { ...this.score },
        currentRound: this.currentRound,
        reFlick: false,
        matchOver: isMatchWin
      };

      this.roundHistory.push({ round: this.currentRound, winner: 'player' });
      if (!isMatchWin) this.currentRound++;

      if (this.onScoreUpdate) {
        this.onScoreUpdate(this.score.player, this.score.opponent, this.currentRound);
      }
      if (this.onRoundComplete) this.onRoundComplete(result);
      if (isMatchWin && this.onMatchComplete) this.onMatchComplete('player', this.score);
      return result;
    }

    // Case 3: Player Knocked Out (Opponent wins round)
    if (playerFallen && !opponentFallen) {
      this.score.opponent++;
      this.totalRoundsPlayed++;

      const isMatchWin = this.score.opponent >= this.targetWins;
      if (isMatchWin) {
        this.matchOver = true;
        this.winner = 'opponent';
        this.setState(MatchState.MATCH_OVER, { winner: 'opponent' });
      }

      const result = {
        type: isMatchWin ? 'MATCH_WIN_OPPONENT' : 'ROUND_WIN_OPPONENT',
        winner: 'opponent',
        message: isMatchWin 
          ? `💀 MATCH KHATAM! ${p2Label} Wins ${this.score.opponent} - ${this.score.player}!` 
          : `💥 Round ${this.currentRound} ${p2Label} ne jeeta! [${p1Label} ${this.score.player} - ${this.score.opponent} ${p2Label}]`,
        score: { ...this.score },
        currentRound: this.currentRound,
        reFlick: false,
        matchOver: isMatchWin
      };

      this.roundHistory.push({ round: this.currentRound, winner: 'opponent' });
      if (!isMatchWin) this.currentRound++;

      if (this.onScoreUpdate) {
        this.onScoreUpdate(this.score.player, this.score.opponent, this.currentRound);
      }
      if (this.onRoundComplete) this.onRoundComplete(result);
      if (isMatchWin && this.onMatchComplete) this.onMatchComplete('opponent', this.score);
      return result;
    }

    // Case 4: Safe Duel - Both Pens on Desk (Turn Passes)
    this.activeTurn = (this.activeTurn === 'player') ? 'opponent' : 'player';
    const nextState = (this.activeTurn === 'player') ? MatchState.P1_AIMING : MatchState.OPPONENT_AIMING;
    this.setState(nextState);

    const activeLabel = this.activeTurn === 'player' ? p1Label : p2Label;
    const result = {
      type: 'TURN_PASS',
      winner: null,
      message: `Round ${this.currentRound} [${this.score.player} - ${this.score.opponent}] - ${activeLabel} ki bari!`,
      score: { ...this.score },
      currentRound: this.currentRound,
      nextTurn: this.activeTurn,
      reFlick: false,
      matchOver: false
    };

    return result;
  }

  prepareNextRound() {
    if (this.matchOver) return;
    this.setState(MatchState.ROUND_RESET);
    this.activeTurn = 'player';
  }

  isInteractionAllowed(side) {
    if (this.matchOver) return false;
    if (this.state === MatchState.P1_AIMING && side === 'player') return true;
    if (this.state === MatchState.OPPONENT_AIMING && side === 'opponent' && this.mode === 'pass_and_play') return true;
    return false;
  }

  getScoreSummary() {
    return {
      player: this.score.player,
      opponent: this.score.opponent,
      currentRound: this.currentRound,
      targetWins: this.targetWins,
      matchOver: this.matchOver,
      winner: this.winner
    };
  }
}
