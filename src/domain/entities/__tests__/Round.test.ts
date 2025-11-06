import { describe, it, expect } from '@jest/globals';
import { Round, RoundType, RoundStatus, DrawType, RoundManager } from '../Round.js';
import { Wind } from '../../valueObjects/Tile.js';

describe('Round', () => {
  describe('Constructor', () => {
    it('should create round with valid parameters', () => {
      const round = new Round(RoundType.EAST, 1, 0);

      expect(round.roundType).toBe(RoundType.EAST);
      expect(round.roundNumber).toBe(1);
      expect(round.dealerSeat).toBe(0);
      expect(round.honbaCount).toBe(0);
      expect(round.riichiSticks).toBe(0);
      expect(round.status).toBe(RoundStatus.NOT_STARTED);
      expect(round.turnCount).toBe(0);
    });

    it('should create round with honba and riichi sticks', () => {
      const round = new Round(RoundType.SOUTH, 2, 1, 3, 2);

      expect(round.honbaCount).toBe(3);
      expect(round.riichiSticks).toBe(2);
    });

    it('should throw error for invalid round number (0)', () => {
      expect(() => new Round(RoundType.EAST, 0, 0)).toThrow(
        'Round number must be between 1 and 4'
      );
    });

    it('should throw error for invalid round number (5)', () => {
      expect(() => new Round(RoundType.EAST, 5, 0)).toThrow(
        'Round number must be between 1 and 4'
      );
    });

    it('should throw error for invalid dealer seat (-1)', () => {
      expect(() => new Round(RoundType.EAST, 1, -1)).toThrow(
        'Dealer seat must be between 0 and 3'
      );
    });

    it('should throw error for invalid dealer seat (4)', () => {
      expect(() => new Round(RoundType.EAST, 1, 4)).toThrow(
        'Dealer seat must be between 0 and 3'
      );
    });
  });

  describe('Round Status Management', () => {
    it('should start round', () => {
      const round = new Round(RoundType.EAST, 1, 0);

      round.start();

      expect(round.status).toBe(RoundStatus.IN_PROGRESS);
    });

    it('should throw error when starting already started round', () => {
      const round = new Round(RoundType.EAST, 1, 0);

      round.start();

      expect(() => round.start()).toThrow('Round has already started');
    });

    it('should finish round with win', () => {
      const round = new Round(RoundType.EAST, 1, 0);

      round.start();
      round.finishWithWin();

      expect(round.status).toBe(RoundStatus.WON);
    });

    it('should finish round with draw', () => {
      const round = new Round(RoundType.EAST, 1, 0);

      round.start();
      round.finishWithDraw(DrawType.EXHAUSTIVE);

      expect(round.status).toBe(RoundStatus.DRAWN);
    });
  });

  describe('Turn Management', () => {
    it('should increment turn count', () => {
      const round = new Round(RoundType.EAST, 1, 0);

      expect(round.turnCount).toBe(0);

      round.incrementTurn();
      expect(round.turnCount).toBe(1);

      round.incrementTurn();
      expect(round.turnCount).toBe(2);
    });
  });

  describe('Honba Management', () => {
    it('should increment honba count', () => {
      const round = new Round(RoundType.EAST, 1, 0);

      expect(round.honbaCount).toBe(0);

      round.incrementHonba();
      expect(round.honbaCount).toBe(1);

      round.incrementHonba();
      expect(round.honbaCount).toBe(2);
    });
  });

  describe('Riichi Sticks Management', () => {
    it('should add riichi stick', () => {
      const round = new Round(RoundType.EAST, 1, 0);

      expect(round.riichiSticks).toBe(0);

      round.addRiichiStick();
      expect(round.riichiSticks).toBe(1);

      round.addRiichiStick();
      expect(round.riichiSticks).toBe(2);
    });

    it('should clear riichi sticks', () => {
      const round = new Round(RoundType.EAST, 1, 0, 0, 3);

      expect(round.riichiSticks).toBe(3);

      round.clearRiichiSticks();

      expect(round.riichiSticks).toBe(0);
    });
  });

  describe('Wind Management', () => {
    it('should get prevalent wind for EAST round', () => {
      const round = new Round(RoundType.EAST, 1, 0);

      expect(round.getPrevalentWind()).toBe(Wind.EAST);
    });

    it('should get prevalent wind for SOUTH round', () => {
      const round = new Round(RoundType.SOUTH, 1, 0);

      expect(round.getPrevalentWind()).toBe(Wind.SOUTH);
    });

    it('should get prevalent wind for WEST round', () => {
      const round = new Round(RoundType.WEST, 1, 0);

      expect(round.getPrevalentWind()).toBe(Wind.WEST);
    });

    it('should get prevalent wind for NORTH round', () => {
      const round = new Round(RoundType.NORTH, 1, 0);

      expect(round.getPrevalentWind()).toBe(Wind.NORTH);
    });

    it('should get seat wind for dealer', () => {
      const round = new Round(RoundType.EAST, 1, 0);

      expect(round.getSeatWind(0)).toBe(Wind.EAST);
    });

    it('should get seat wind for other players', () => {
      const round = new Round(RoundType.EAST, 1, 0);

      expect(round.getSeatWind(0)).toBe(Wind.EAST);
      expect(round.getSeatWind(1)).toBe(Wind.SOUTH);
      expect(round.getSeatWind(2)).toBe(Wind.WEST);
      expect(round.getSeatWind(3)).toBe(Wind.NORTH);
    });

    it('should get seat wind when dealer is not seat 0', () => {
      const round = new Round(RoundType.EAST, 2, 1);

      expect(round.getSeatWind(1)).toBe(Wind.EAST); // Dealer
      expect(round.getSeatWind(2)).toBe(Wind.SOUTH);
      expect(round.getSeatWind(3)).toBe(Wind.WEST);
      expect(round.getSeatWind(0)).toBe(Wind.NORTH);
    });
  });

  describe('Display Name', () => {
    it('should get display name without honba', () => {
      const round = new Round(RoundType.EAST, 1, 0);

      expect(round.getDisplayName()).toBe('東1局');
    });

    it('should get display name with honba', () => {
      const round = new Round(RoundType.EAST, 1, 0, 2);

      expect(round.getDisplayName()).toBe('東1局 2本場');
    });

    it('should get display name for different rounds', () => {
      const eastRound = new Round(RoundType.EAST, 3, 0);
      const southRound = new Round(RoundType.SOUTH, 2, 0);
      const westRound = new Round(RoundType.WEST, 4, 0);
      const northRound = new Round(RoundType.NORTH, 1, 0);

      expect(eastRound.getDisplayName()).toBe('東3局');
      expect(southRound.getDisplayName()).toBe('南2局');
      expect(westRound.getDisplayName()).toBe('西4局');
      expect(northRound.getDisplayName()).toBe('北1局');
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON', () => {
      const round = new Round(RoundType.EAST, 1, 0, 2, 1);
      round.start();
      round.incrementTurn();

      const json = round.toJSON();

      expect(json).toHaveProperty('roundType');
      expect(json).toHaveProperty('roundNumber');
      expect(json).toHaveProperty('dealerSeat');
      expect(json).toHaveProperty('honbaCount');
      expect(json).toHaveProperty('riichiSticks');
      expect(json).toHaveProperty('status');
      expect(json).toHaveProperty('turnCount');
    });

    it('should deserialize from JSON', () => {
      const original = new Round(RoundType.SOUTH, 3, 2, 1, 2);
      original.start();
      original.incrementTurn();
      original.incrementTurn();

      const json = original.toJSON();
      const restored = Round.fromJSON(json);

      expect(restored.roundType).toBe(original.roundType);
      expect(restored.roundNumber).toBe(original.roundNumber);
      expect(restored.dealerSeat).toBe(original.dealerSeat);
      expect(restored.honbaCount).toBe(original.honbaCount);
      expect(restored.riichiSticks).toBe(original.riichiSticks);
      expect(restored.status).toBe(original.status);
      expect(restored.turnCount).toBe(original.turnCount);
    });
  });
});

describe('RoundManager', () => {
  describe('nextRound', () => {
    it('should increment honba when dealer wins', () => {
      const current = new Round(RoundType.EAST, 1, 0, 0);

      const next = RoundManager.nextRound(current, true, false);

      expect(next.roundType).toBe(RoundType.EAST);
      expect(next.roundNumber).toBe(1);
      expect(next.dealerSeat).toBe(0);
      expect(next.honbaCount).toBe(1);
    });

    it('should increment honba on draw', () => {
      const current = new Round(RoundType.EAST, 1, 0, 0);

      const next = RoundManager.nextRound(current, false, true);

      expect(next.roundType).toBe(RoundType.EAST);
      expect(next.roundNumber).toBe(1);
      expect(next.dealerSeat).toBe(0);
      expect(next.honbaCount).toBe(1);
    });

    it('should rotate dealer when dealer loses', () => {
      const current = new Round(RoundType.EAST, 1, 0, 0);

      const next = RoundManager.nextRound(current, false, false);

      expect(next.roundType).toBe(RoundType.EAST);
      expect(next.roundNumber).toBe(2);
      expect(next.dealerSeat).toBe(1);
      expect(next.honbaCount).toBe(0);
    });

    it('should move to next round type after 4 rounds', () => {
      const current = new Round(RoundType.EAST, 4, 3, 0);

      const next = RoundManager.nextRound(current, false, false);

      expect(next.roundType).toBe(RoundType.SOUTH);
      expect(next.roundNumber).toBe(1);
      expect(next.dealerSeat).toBe(0);
      expect(next.honbaCount).toBe(0);
    });

    it('should progress through all round types', () => {
      let round = new Round(RoundType.EAST, 4, 3);

      round = RoundManager.nextRound(round, false, false);
      expect(round.roundType).toBe(RoundType.SOUTH);
      expect(round.roundNumber).toBe(1);

      round = new Round(RoundType.SOUTH, 4, 3);
      round = RoundManager.nextRound(round, false, false);
      expect(round.roundType).toBe(RoundType.WEST);
      expect(round.roundNumber).toBe(1);

      round = new Round(RoundType.WEST, 4, 3);
      round = RoundManager.nextRound(round, false, false);
      expect(round.roundType).toBe(RoundType.NORTH);
      expect(round.roundNumber).toBe(1);
    });

    it('should throw error when trying to advance past North 4', () => {
      const current = new Round(RoundType.NORTH, 4, 3);

      expect(() => RoundManager.nextRound(current, false, false)).toThrow('Game is finished');
    });

    it('should preserve riichi sticks across rounds', () => {
      const current = new Round(RoundType.EAST, 1, 0, 0, 3);

      const next = RoundManager.nextRound(current, false, false);

      expect(next.riichiSticks).toBe(3);
    });

    it('should wrap dealer seat from 3 to 0', () => {
      const current = new Round(RoundType.EAST, 1, 3);

      const next = RoundManager.nextRound(current, false, false);

      expect(next.dealerSeat).toBe(0);
    });
  });

  describe('isGameFinished', () => {
    it('should detect end of tonpuu game (East 4)', () => {
      const round = new Round(RoundType.EAST, 4, 0);

      expect(RoundManager.isGameFinished(round, 'tonpuu')).toBe(true);
    });

    it('should not finish tonpuu game before East 4', () => {
      const round = new Round(RoundType.EAST, 3, 0);

      expect(RoundManager.isGameFinished(round, 'tonpuu')).toBe(false);
    });

    it('should detect end of hanchan game (South 4)', () => {
      const round = new Round(RoundType.SOUTH, 4, 0);

      expect(RoundManager.isGameFinished(round, 'hanchan')).toBe(true);
    });

    it('should not finish hanchan game before South 4', () => {
      const roundEast = new Round(RoundType.EAST, 4, 0);
      const roundSouth = new Round(RoundType.SOUTH, 3, 0);

      expect(RoundManager.isGameFinished(roundEast, 'hanchan')).toBe(false);
      expect(RoundManager.isGameFinished(roundSouth, 'hanchan')).toBe(false);
    });

    it('should return false for unknown game types', () => {
      const round = new Round(RoundType.NORTH, 4, 0);

      expect(RoundManager.isGameFinished(round, 'unknown')).toBe(false);
    });
  });
});
