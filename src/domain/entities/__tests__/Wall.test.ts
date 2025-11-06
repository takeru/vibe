import { describe, it, expect } from '@jest/globals';
import { Wall } from '../Wall.js';
import { Tile, TileSuit, Wind, Dragon } from '../../valueObjects/Tile.js';

describe('Wall', () => {
  describe('Constructor', () => {
    it('should create wall with 136 total tiles', () => {
      const wall = new Wall();

      // Wall tiles (122) + dead wall (14) = 136
      const totalTiles = wall.tiles.length + wall.deadWall.length;
      expect(totalTiles).toBe(136);
    });

    it('should create wall with correct tile distribution', () => {
      const wall = new Wall(false);

      // 122 tiles in main wall (136 - 14 dead wall)
      expect(wall.tiles.length).toBe(122);
      // 14 tiles in dead wall
      expect(wall.deadWall.length).toBe(14);
    });

    it('should have all tiles with unique IDs', () => {
      const wall = new Wall();
      const allTiles = [...wall.tiles, ...wall.deadWall];
      const ids = allTiles.map(t => t.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(136);
    });

    it('should create wall with red dora when enabled', () => {
      const wall = new Wall(true);
      const allTiles = [...wall.tiles, ...wall.deadWall];
      const redTiles = allTiles.filter(t => t.isRed);

      expect(redTiles.length).toBe(3); // 3 red 5s
    });

    it('should not have red dora when disabled', () => {
      const wall = new Wall(false);
      const allTiles = [...wall.tiles, ...wall.deadWall];
      const redTiles = allTiles.filter(t => t.isRed);

      expect(redTiles.length).toBe(0);
    });

    it('should have initial remaining count of 122', () => {
      const wall = new Wall();
      expect(wall.getRemainingCount()).toBe(122);
    });
  });

  describe('Drawing Tiles', () => {
    it('should draw tile from wall', () => {
      const wall = new Wall();
      const initialCount = wall.getRemainingCount();

      const tile = wall.drawTile();

      expect(tile).not.toBeNull();
      expect(wall.getRemainingCount()).toBe(initialCount - 1);
    });

    it('should draw different tiles sequentially', () => {
      const wall = new Wall();

      const tile1 = wall.drawTile();
      const tile2 = wall.drawTile();

      expect(tile1).not.toBeNull();
      expect(tile2).not.toBeNull();
      expect(tile1!.id).not.toBe(tile2!.id);
    });

    it('should return null when wall is empty', () => {
      const wall = new Wall();

      // Draw all tiles
      for (let i = 0; i < 122; i++) {
        wall.drawTile();
      }

      const tile = wall.drawTile();

      expect(tile).toBeNull();
      expect(wall.isEmpty()).toBe(true);
    });

    it('should draw rinshan tile after kan', () => {
      const wall = new Wall();

      const rinshanTile = wall.drawRinshanTile();

      expect(rinshanTile).not.toBeNull();
      expect(rinshanTile).toBe(wall.deadWall[0]);
    });

    it('should draw up to 4 rinshan tiles', () => {
      const wall = new Wall();

      const rinshan1 = wall.drawRinshanTile();
      const rinshan2 = wall.drawRinshanTile();
      const rinshan3 = wall.drawRinshanTile();
      const rinshan4 = wall.drawRinshanTile();

      expect(rinshan1).not.toBeNull();
      expect(rinshan2).not.toBeNull();
      expect(rinshan3).not.toBeNull();
      expect(rinshan4).not.toBeNull();
    });

    it('should return null when no rinshan tiles left', () => {
      const wall = new Wall();

      // Draw all 4 rinshan tiles
      for (let i = 0; i < 4; i++) {
        wall.drawRinshanTile();
      }

      const tile = wall.drawRinshanTile();

      expect(tile).toBeNull();
    });
  });

  describe('Remaining Count', () => {
    it('should decrement remaining count when drawing', () => {
      const wall = new Wall();

      expect(wall.getRemainingCount()).toBe(122);

      wall.drawTile();
      expect(wall.getRemainingCount()).toBe(121);

      wall.drawTile();
      expect(wall.getRemainingCount()).toBe(120);
    });

    it('should not affect remaining count when drawing rinshan', () => {
      const wall = new Wall();
      const initialCount = wall.getRemainingCount();

      wall.drawRinshanTile();

      expect(wall.getRemainingCount()).toBe(initialCount);
    });
  });

  describe('isEmpty', () => {
    it('should return false when wall has tiles', () => {
      const wall = new Wall();
      expect(wall.isEmpty()).toBe(false);
    });

    it('should return true when wall is exhausted', () => {
      const wall = new Wall();

      // Draw all tiles
      for (let i = 0; i < 122; i++) {
        wall.drawTile();
      }

      expect(wall.isEmpty()).toBe(true);
    });
  });

  describe('Dora Indicators', () => {
    it('should have 1 active dora indicator initially', () => {
      const wall = new Wall();

      const indicators = wall.getActiveDoraIndicators(0);

      expect(indicators.length).toBe(1);
    });

    it('should add dora indicators for each kan', () => {
      const wall = new Wall();

      const indicators0 = wall.getActiveDoraIndicators(0);
      const indicators1 = wall.getActiveDoraIndicators(1);
      const indicators2 = wall.getActiveDoraIndicators(2);

      expect(indicators0.length).toBe(1);
      expect(indicators1.length).toBe(2);
      expect(indicators2.length).toBe(3);
    });

    it('should have maximum 5 dora indicators', () => {
      const wall = new Wall();

      const indicators = wall.getActiveDoraIndicators(4);

      expect(indicators.length).toBe(5);
    });

    it('should have ura dora indicators', () => {
      const wall = new Wall();

      const uraIndicators = wall.getUraDoraIndicators(0);

      expect(uraIndicators.length).toBe(1);
    });

    it('should add ura dora indicators for each kan', () => {
      const wall = new Wall();

      const uraIndicators0 = wall.getUraDoraIndicators(0);
      const uraIndicators1 = wall.getUraDoraIndicators(1);
      const uraIndicators2 = wall.getUraDoraIndicators(2);

      expect(uraIndicators0.length).toBe(1);
      expect(uraIndicators1.length).toBe(2);
      expect(uraIndicators2.length).toBe(3);
    });
  });

  describe('getDoraFromIndicator', () => {
    it('should get next number tile for number tiles', () => {
      const indicator = new Tile(TileSuit.MAN, 3);
      const dora = Wall.getDoraFromIndicator(indicator);

      expect(dora.suit).toBe(TileSuit.MAN);
      expect(dora.value).toBe(4);
    });

    it('should wrap 9 to 1 for number tiles', () => {
      const indicator = new Tile(TileSuit.PIN, 9);
      const dora = Wall.getDoraFromIndicator(indicator);

      expect(dora.suit).toBe(TileSuit.PIN);
      expect(dora.value).toBe(1);
    });

    it('should cycle wind tiles (east → south)', () => {
      const indicator = new Tile(TileSuit.HONOR, Wind.EAST);
      const dora = Wall.getDoraFromIndicator(indicator);

      expect(dora.suit).toBe(TileSuit.HONOR);
      expect(dora.value).toBe(Wind.SOUTH);
    });

    it('should cycle wind tiles (north → east)', () => {
      const indicator = new Tile(TileSuit.HONOR, Wind.NORTH);
      const dora = Wall.getDoraFromIndicator(indicator);

      expect(dora.suit).toBe(TileSuit.HONOR);
      expect(dora.value).toBe(Wind.EAST);
    });

    it('should cycle dragon tiles (white → green)', () => {
      const indicator = new Tile(TileSuit.HONOR, Dragon.WHITE);
      const dora = Wall.getDoraFromIndicator(indicator);

      expect(dora.suit).toBe(TileSuit.HONOR);
      expect(dora.value).toBe(Dragon.GREEN);
    });

    it('should cycle dragon tiles (red → white)', () => {
      const indicator = new Tile(TileSuit.HONOR, Dragon.RED);
      const dora = Wall.getDoraFromIndicator(indicator);

      expect(dora.suit).toBe(TileSuit.HONOR);
      expect(dora.value).toBe(Dragon.WHITE);
    });
  });

  describe('countDora', () => {
    it('should count matching dora tiles', () => {
      const tiles = [
        new Tile(TileSuit.MAN, 5),
        new Tile(TileSuit.MAN, 5),
        new Tile(TileSuit.MAN, 6),
      ];
      const indicators = [new Tile(TileSuit.MAN, 4)]; // Dora is 5m

      const doraCount = Wall.countDora(tiles, indicators);

      expect(doraCount).toBe(2);
    });

    it('should count red dora', () => {
      const tiles = [
        new Tile(TileSuit.MAN, 5, true), // Red dora
        new Tile(TileSuit.MAN, 6),
      ];
      const indicators = [new Tile(TileSuit.PIN, 1)]; // Unrelated indicator

      const doraCount = Wall.countDora(tiles, indicators);

      expect(doraCount).toBe(1); // Red 5 counts as dora
    });

    it('should count multiple dora indicators', () => {
      const tiles = [
        new Tile(TileSuit.MAN, 5),
        new Tile(TileSuit.PIN, 3),
        new Tile(TileSuit.SOU, 7),
      ];
      const indicators = [
        new Tile(TileSuit.MAN, 4), // Dora is 5m
        new Tile(TileSuit.PIN, 2), // Dora is 3p
      ];

      const doraCount = Wall.countDora(tiles, indicators);

      expect(doraCount).toBe(2);
    });

    it('should return 0 when no dora', () => {
      const tiles = [
        new Tile(TileSuit.MAN, 1),
        new Tile(TileSuit.MAN, 2),
      ];
      const indicators = [new Tile(TileSuit.MAN, 5)]; // Dora is 6m

      const doraCount = Wall.countDora(tiles, indicators);

      expect(doraCount).toBe(0);
    });

    it('should count dora multiple times if tile appears multiple times', () => {
      const tiles = [
        new Tile(TileSuit.MAN, 5),
        new Tile(TileSuit.MAN, 5),
        new Tile(TileSuit.MAN, 5),
      ];
      const indicators = [new Tile(TileSuit.MAN, 4)]; // Dora is 5m

      const doraCount = Wall.countDora(tiles, indicators);

      expect(doraCount).toBe(3);
    });
  });

  describe('dealInitialHands', () => {
    it('should deal 13 tiles to each player', () => {
      const wall = new Wall();

      const hands = wall.dealInitialHands(4);

      expect(hands.length).toBe(4);
      for (const hand of hands) {
        expect(hand.length).toBe(13);
      }
    });

    it('should deal tiles to fewer players', () => {
      const wall = new Wall();

      const hands = wall.dealInitialHands(2);

      expect(hands.length).toBe(2);
      for (const hand of hands) {
        expect(hand.length).toBe(13);
      }
    });

    it('should update remaining count after dealing', () => {
      const wall = new Wall();

      wall.dealInitialHands(4);

      // 122 - (4 players * 13 tiles) = 70 remaining
      expect(wall.getRemainingCount()).toBe(70);
    });

    it('should throw error for invalid player count (0)', () => {
      const wall = new Wall();

      expect(() => wall.dealInitialHands(0)).toThrow('Player count must be between 1 and 4');
    });

    it('should throw error for invalid player count (5)', () => {
      const wall = new Wall();

      expect(() => wall.dealInitialHands(5)).toThrow('Player count must be between 1 and 4');
    });

    it('should give unique tiles to each player', () => {
      const wall = new Wall();

      const hands = wall.dealInitialHands(4);

      const allDealtTileIds = hands.flat().map(t => t.id);
      const uniqueIds = new Set(allDealtTileIds);

      expect(uniqueIds.size).toBe(52); // 4 players * 13 tiles
    });
  });

  describe('Defensive Copying', () => {
    it('should return defensive copy of tiles', () => {
      const wall = new Wall();

      const tiles1 = wall.tiles;
      const tiles2 = wall.tiles;

      expect(tiles1).not.toBe(tiles2);
    });

    it('should return defensive copy of dead wall', () => {
      const wall = new Wall();

      const deadWall1 = wall.deadWall;
      const deadWall2 = wall.deadWall;

      expect(deadWall1).not.toBe(deadWall2);
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON', () => {
      const wall = new Wall();
      wall.drawTile();
      wall.drawRinshanTile();

      const json = wall.toJSON();

      expect(json).toHaveProperty('tiles');
      expect(json).toHaveProperty('deadWall');
      expect(json).toHaveProperty('doraIndicators');
      expect(json).toHaveProperty('uraDoraIndicators');
      expect(json).toHaveProperty('drawIndex');
      expect(json).toHaveProperty('rinshanIndex');
    });

    it('should deserialize from JSON and maintain state', () => {
      const originalWall = new Wall();
      originalWall.drawTile();
      originalWall.drawTile();
      originalWall.drawRinshanTile();

      const json = originalWall.toJSON();
      const restoredWall = Wall.fromJSON(json);

      expect(restoredWall.getRemainingCount()).toBe(originalWall.getRemainingCount());
      expect(restoredWall.tiles.length).toBe(originalWall.tiles.length);
      expect(restoredWall.deadWall.length).toBe(originalWall.deadWall.length);
    });
  });
});
