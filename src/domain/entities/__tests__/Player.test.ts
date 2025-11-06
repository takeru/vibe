import { describe, it, expect } from '@jest/globals';
import { Player, PlayerStatus } from '../Player.js';
import { Tile, TileSuit } from '../../valueObjects/Tile.js';
import { MeldFactory, MeldSource } from '../../valueObjects/Meld.js';

describe('Player', () => {
  describe('Constructor', () => {
    it('should create player with default score', () => {
      const player = new Player('p1', 'Player 1', 0);

      expect(player.id).toBe('p1');
      expect(player.name).toBe('Player 1');
      expect(player.seat).toBe(0);
      expect(player.score).toBe(25000);
      expect(player.status).toBe(PlayerStatus.NORMAL);
    });

    it('should create player with custom initial score', () => {
      const player = new Player('p1', 'Player 1', 0, 30000);

      expect(player.score).toBe(30000);
    });

    it('should throw error for invalid seat (-1)', () => {
      expect(() => new Player('p1', 'Player 1', -1)).toThrow('Seat must be between 0 and 3');
    });

    it('should throw error for invalid seat (4)', () => {
      expect(() => new Player('p1', 'Player 1', 4)).toThrow('Seat must be between 0 and 3');
    });

    it('should initialize with empty hand and discards', () => {
      const player = new Player('p1', 'Player 1', 0);

      expect(player.hand.concealedTiles.length).toBe(0);
      expect(player.discards.length).toBe(0);
    });

    it('should initialize with normal status', () => {
      const player = new Player('p1', 'Player 1', 0);

      expect(player.status).toBe(PlayerStatus.NORMAL);
      expect(player.isRiichi()).toBe(false);
      expect(player.furiten).toBe(false);
      expect(player.riichiTurn).toBeNull();
    });
  });

  describe('Drawing and Discarding Tiles', () => {
    it('should draw tile to hand', () => {
      const player = new Player('p1', 'Player 1', 0);
      const tile = new Tile(TileSuit.MAN, 5);

      player.drawTile(tile);

      expect(player.hand.concealedTiles.length).toBe(1);
      expect(player.hand.concealedTiles[0]).toBe(tile);
    });

    it('should discard tile from hand', () => {
      const player = new Player('p1', 'Player 1', 0);
      const tile = new Tile(TileSuit.MAN, 5, false, 'tile1');

      player.drawTile(tile);
      const discarded = player.discardTile('tile1');

      expect(discarded).toBe(tile);
      expect(player.hand.concealedTiles.length).toBe(0);
      expect(player.discards.length).toBe(1);
      expect(player.discards[0]).toBe(tile);
    });

    it('should return null when discarding non-existent tile', () => {
      const player = new Player('p1', 'Player 1', 0);

      const discarded = player.discardTile('non-existent');

      expect(discarded).toBeNull();
      expect(player.discards.length).toBe(0);
    });

    it('should get last discard', () => {
      const player = new Player('p1', 'Player 1', 0);
      const tile1 = new Tile(TileSuit.MAN, 1, false, 'tile1');
      const tile2 = new Tile(TileSuit.MAN, 2, false, 'tile2');

      player.drawTile(tile1);
      player.drawTile(tile2);
      player.discardTile('tile1');
      player.discardTile('tile2');

      expect(player.getLastDiscard()).toBe(tile2);
    });

    it('should return null for last discard when no discards', () => {
      const player = new Player('p1', 'Player 1', 0);

      expect(player.getLastDiscard()).toBeNull();
    });
  });

  describe('Riichi', () => {
    it('should declare riichi with concealed hand', () => {
      const player = new Player('p1', 'Player 1', 0, 25000);

      player.declareRiichi(5);

      expect(player.status).toBe(PlayerStatus.RIICHI);
      expect(player.isRiichi()).toBe(true);
      expect(player.riichiTurn).toBe(5);
      expect(player.score).toBe(24000); // 1000 point deposit
    });

    it('should declare double riichi on first turn', () => {
      const player = new Player('p1', 'Player 1', 0, 25000);

      player.declareRiichi(1);

      expect(player.status).toBe(PlayerStatus.DOUBLE_RIICHI);
      expect(player.isRiichi()).toBe(true);
      expect(player.riichiTurn).toBe(1);
      expect(player.score).toBe(24000);
    });

    it('should throw error when declaring riichi with open hand', () => {
      const player = new Player('p1', 'Player 1', 0, 25000);

      // Add an open meld
      const meld = MeldFactory.createPon(
        [
          new Tile(TileSuit.MAN, 5),
          new Tile(TileSuit.MAN, 5),
          new Tile(TileSuit.MAN, 5),
        ],
        new Tile(TileSuit.MAN, 5),
        MeldSource.KAMICHA
      );
      player.hand.addMeld(meld);

      expect(() => player.declareRiichi(5)).toThrow('Cannot riichi with open hand');
    });

    it('should throw error when not enough points for riichi', () => {
      const player = new Player('p1', 'Player 1', 0, 500);

      expect(() => player.declareRiichi(5)).toThrow('Not enough points to riichi');
    });
  });

  describe('Score Management', () => {
    it('should add score', () => {
      const player = new Player('p1', 'Player 1', 0, 25000);

      player.addScore(5000);

      expect(player.score).toBe(30000);
    });

    it('should subtract score', () => {
      const player = new Player('p1', 'Player 1', 0, 25000);

      player.subtractScore(3000);

      expect(player.score).toBe(22000);
    });

    it('should not allow negative score', () => {
      const player = new Player('p1', 'Player 1', 0, 25000);

      player.subtractScore(30000);

      expect(player.score).toBe(0);
    });

    it('should handle negative point addition', () => {
      const player = new Player('p1', 'Player 1', 0, 25000);

      player.addScore(-5000);

      expect(player.score).toBe(20000);
    });
  });

  describe('Hand Reset', () => {
    it('should reset hand and status', () => {
      const player = new Player('p1', 'Player 1', 0, 25000);

      // Add some state
      player.drawTile(new Tile(TileSuit.MAN, 5, false, 'tile1'));
      player.discardTile('tile1');
      player.declareRiichi(5);
      player.furiten = true;

      player.resetHand();

      expect(player.hand.concealedTiles.length).toBe(0);
      expect(player.discards.length).toBe(0);
      expect(player.status).toBe(PlayerStatus.NORMAL);
      expect(player.riichiTurn).toBeNull();
      expect(player.furiten).toBe(false);
    });

    it('should not reset score when resetting hand', () => {
      const player = new Player('p1', 'Player 1', 0, 25000);

      player.addScore(5000);
      player.resetHand();

      expect(player.score).toBe(30000);
    });
  });

  describe('Position Checking', () => {
    it('should check kamicha (left player)', () => {
      const player = new Player('p1', 'Player 1', 0);

      expect(player.isKamicha(1)).toBe(true); // Seat 0 is kamicha of seat 1
      expect(player.isKamicha(0)).toBe(false);
      expect(player.isKamicha(2)).toBe(false);
      expect(player.isKamicha(3)).toBe(false);
    });

    it('should check kamicha with wrapping', () => {
      const player = new Player('p1', 'Player 1', 3);

      expect(player.isKamicha(0)).toBe(true); // Seat 3 is kamicha of seat 0
    });

    it('should check toimen (opposite player)', () => {
      const player = new Player('p1', 'Player 1', 0);

      expect(player.isToimen(2)).toBe(true); // Seat 0 is toimen of seat 2
      expect(player.isToimen(0)).toBe(false);
      expect(player.isToimen(1)).toBe(false);
      expect(player.isToimen(3)).toBe(false);
    });

    it('should check shimocha (right player)', () => {
      const player = new Player('p1', 'Player 1', 0);

      expect(player.isShimocha(3)).toBe(true); // Seat 0 is shimocha of seat 3
      expect(player.isShimocha(0)).toBe(false);
      expect(player.isShimocha(1)).toBe(false);
      expect(player.isShimocha(2)).toBe(false);
    });

    it('should check all positions for seat 1', () => {
      const player = new Player('p1', 'Player 1', 1);

      expect(player.isKamicha(2)).toBe(true);
      expect(player.isToimen(3)).toBe(true);
      expect(player.isShimocha(0)).toBe(true);
    });
  });

  describe('Status Checks', () => {
    it('should check concealed status', () => {
      const player = new Player('p1', 'Player 1', 0);

      expect(player.isConcealed()).toBe(true);

      // Add open meld
      const meld = MeldFactory.createPon(
        [
          new Tile(TileSuit.MAN, 5),
          new Tile(TileSuit.MAN, 5),
          new Tile(TileSuit.MAN, 5),
        ],
        new Tile(TileSuit.MAN, 5),
        MeldSource.KAMICHA
      );
      player.hand.addMeld(meld);

      expect(player.isConcealed()).toBe(false);
    });

    it('should check riichi status for normal riichi', () => {
      const player = new Player('p1', 'Player 1', 0, 25000);

      expect(player.isRiichi()).toBe(false);

      player.declareRiichi(5);

      expect(player.isRiichi()).toBe(true);
    });

    it('should check riichi status for double riichi', () => {
      const player = new Player('p1', 'Player 1', 0, 25000);

      player.declareRiichi(1);

      expect(player.isRiichi()).toBe(true);
      expect(player.status).toBe(PlayerStatus.DOUBLE_RIICHI);
    });
  });

  describe('Getters and Setters', () => {
    it('should get and set name', () => {
      const player = new Player('p1', 'Player 1', 0);

      expect(player.name).toBe('Player 1');

      player.name = 'New Name';

      expect(player.name).toBe('New Name');
    });

    it('should get and set status', () => {
      const player = new Player('p1', 'Player 1', 0);

      player.status = PlayerStatus.TENPAI;

      expect(player.status).toBe(PlayerStatus.TENPAI);
    });

    it('should get and set furiten', () => {
      const player = new Player('p1', 'Player 1', 0);

      expect(player.furiten).toBe(false);

      player.furiten = true;

      expect(player.furiten).toBe(true);
    });

    it('should return defensive copy of discards', () => {
      const player = new Player('p1', 'Player 1', 0);
      const tile = new Tile(TileSuit.MAN, 5, false, 'tile1');

      player.drawTile(tile);
      player.discardTile('tile1');

      const discards1 = player.discards;
      const discards2 = player.discards;

      expect(discards1).not.toBe(discards2);
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON', () => {
      const player = new Player('p1', 'Player 1', 0, 25000);
      player.drawTile(new Tile(TileSuit.MAN, 5, false, 'tile1'));
      player.discardTile('tile1');
      player.declareRiichi(5);

      const json = player.toJSON();

      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('name');
      expect(json).toHaveProperty('seat');
      expect(json).toHaveProperty('score');
      expect(json).toHaveProperty('hand');
      expect(json).toHaveProperty('discards');
      expect(json).toHaveProperty('status');
      expect(json).toHaveProperty('riichiTurn');
      expect(json).toHaveProperty('furiten');
    });

    it('should deserialize from JSON', () => {
      const original = new Player('p1', 'Player 1', 0, 25000);
      original.drawTile(new Tile(TileSuit.MAN, 5, false, 'tile1'));
      original.drawTile(new Tile(TileSuit.MAN, 6, false, 'tile2'));
      original.discardTile('tile1');
      original.declareRiichi(5);

      const json = original.toJSON();
      const restored = Player.fromJSON(json);

      expect(restored.id).toBe(original.id);
      expect(restored.name).toBe(original.name);
      expect(restored.seat).toBe(original.seat);
      expect(restored.score).toBe(original.score);
      expect(restored.status).toBe(original.status);
      expect(restored.riichiTurn).toBe(original.riichiTurn);
      expect(restored.furiten).toBe(original.furiten);
      expect(restored.hand.concealedTiles.length).toBe(original.hand.concealedTiles.length);
      expect(restored.discards.length).toBe(original.discards.length);
    });
  });
});
