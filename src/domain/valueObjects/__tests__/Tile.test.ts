import { describe, it, expect } from '@jest/globals';
import { Tile, TileSuit, Wind, Dragon, TileFactory } from '../Tile.js';

describe('Tile', () => {
  describe('Constructor and Validation', () => {
    it('should create a valid number tile', () => {
      const tile = new Tile(TileSuit.MAN, 5);
      expect(tile.suit).toBe(TileSuit.MAN);
      expect(tile.value).toBe(5);
      expect(tile.isRed).toBe(false);
      expect(tile.id).toBeDefined();
    });

    it('should create a valid red dora tile', () => {
      const tile = new Tile(TileSuit.PIN, 5, true);
      expect(tile.suit).toBe(TileSuit.PIN);
      expect(tile.value).toBe(5);
      expect(tile.isRed).toBe(true);
    });

    it('should create a valid honor tile', () => {
      const tile = new Tile(TileSuit.HONOR, Wind.EAST);
      expect(tile.suit).toBe(TileSuit.HONOR);
      expect(tile.value).toBe(1);
      expect(tile.isRed).toBe(false);
    });

    it('should throw error for invalid number tile value (0)', () => {
      expect(() => new Tile(TileSuit.MAN, 0)).toThrow('Invalid number tile value: 0. Must be 1-9.');
    });

    it('should throw error for invalid number tile value (10)', () => {
      expect(() => new Tile(TileSuit.SOU, 10)).toThrow('Invalid number tile value: 10. Must be 1-9.');
    });

    it('should throw error for invalid honor tile value (0)', () => {
      expect(() => new Tile(TileSuit.HONOR, 0)).toThrow('Invalid honor tile value: 0. Must be 1-7.');
    });

    it('should throw error for invalid honor tile value (8)', () => {
      expect(() => new Tile(TileSuit.HONOR, 8)).toThrow('Invalid honor tile value: 8. Must be 1-7.');
    });

    it('should throw error for red honor tile', () => {
      expect(() => new Tile(TileSuit.HONOR, 1, true)).toThrow('Honor tiles cannot be red dora');
    });

    it('should throw error for red dora on non-5 tile', () => {
      expect(() => new Tile(TileSuit.MAN, 3, true)).toThrow('Only 5 tiles can be red dora');
    });

    it('should accept custom id', () => {
      const customId = 'custom-id-123';
      const tile = new Tile(TileSuit.MAN, 5, false, customId);
      expect(tile.id).toBe(customId);
    });
  });

  describe('Type Checking Methods', () => {
    it('should identify number tiles correctly', () => {
      const manTile = new Tile(TileSuit.MAN, 5);
      const pinTile = new Tile(TileSuit.PIN, 3);
      const souTile = new Tile(TileSuit.SOU, 7);
      const honorTile = new Tile(TileSuit.HONOR, 1);

      expect(manTile.isNumber()).toBe(true);
      expect(pinTile.isNumber()).toBe(true);
      expect(souTile.isNumber()).toBe(true);
      expect(honorTile.isNumber()).toBe(false);
    });

    it('should identify honor tiles correctly', () => {
      const numberTile = new Tile(TileSuit.MAN, 5);
      const eastWind = new Tile(TileSuit.HONOR, Wind.EAST);
      const whiteDragon = new Tile(TileSuit.HONOR, Dragon.WHITE);

      expect(numberTile.isHonor()).toBe(false);
      expect(eastWind.isHonor()).toBe(true);
      expect(whiteDragon.isHonor()).toBe(true);
    });

    it('should identify wind tiles correctly', () => {
      const east = new Tile(TileSuit.HONOR, Wind.EAST);
      const south = new Tile(TileSuit.HONOR, Wind.SOUTH);
      const west = new Tile(TileSuit.HONOR, Wind.WEST);
      const north = new Tile(TileSuit.HONOR, Wind.NORTH);
      const white = new Tile(TileSuit.HONOR, Dragon.WHITE);

      expect(east.isWind()).toBe(true);
      expect(south.isWind()).toBe(true);
      expect(west.isWind()).toBe(true);
      expect(north.isWind()).toBe(true);
      expect(white.isWind()).toBe(false);
    });

    it('should identify dragon tiles correctly', () => {
      const white = new Tile(TileSuit.HONOR, Dragon.WHITE);
      const green = new Tile(TileSuit.HONOR, Dragon.GREEN);
      const red = new Tile(TileSuit.HONOR, Dragon.RED);
      const east = new Tile(TileSuit.HONOR, Wind.EAST);

      expect(white.isDragon()).toBe(true);
      expect(green.isDragon()).toBe(true);
      expect(red.isDragon()).toBe(true);
      expect(east.isDragon()).toBe(false);
    });

    it('should identify terminal tiles correctly', () => {
      const one = new Tile(TileSuit.MAN, 1);
      const nine = new Tile(TileSuit.SOU, 9);
      const five = new Tile(TileSuit.PIN, 5);
      const honor = new Tile(TileSuit.HONOR, Wind.EAST);

      expect(one.isTerminal()).toBe(true);
      expect(nine.isTerminal()).toBe(true);
      expect(five.isTerminal()).toBe(false);
      expect(honor.isTerminal()).toBe(true);
    });

    it('should identify terminal number tiles correctly', () => {
      const one = new Tile(TileSuit.MAN, 1);
      const nine = new Tile(TileSuit.SOU, 9);
      const five = new Tile(TileSuit.PIN, 5);
      const honor = new Tile(TileSuit.HONOR, Wind.EAST);

      expect(one.isTerminalNumber()).toBe(true);
      expect(nine.isTerminalNumber()).toBe(true);
      expect(five.isTerminalNumber()).toBe(false);
      expect(honor.isTerminalNumber()).toBe(false);
    });

    it('should identify simple tiles correctly', () => {
      const two = new Tile(TileSuit.MAN, 2);
      const five = new Tile(TileSuit.PIN, 5);
      const eight = new Tile(TileSuit.SOU, 8);
      const one = new Tile(TileSuit.MAN, 1);
      const nine = new Tile(TileSuit.SOU, 9);
      const honor = new Tile(TileSuit.HONOR, Wind.EAST);

      expect(two.isSimple()).toBe(true);
      expect(five.isSimple()).toBe(true);
      expect(eight.isSimple()).toBe(true);
      expect(one.isSimple()).toBe(false);
      expect(nine.isSimple()).toBe(false);
      expect(honor.isSimple()).toBe(false);
    });

    it('should identify green tiles correctly', () => {
      const sou2 = new Tile(TileSuit.SOU, 2);
      const sou3 = new Tile(TileSuit.SOU, 3);
      const sou4 = new Tile(TileSuit.SOU, 4);
      const sou6 = new Tile(TileSuit.SOU, 6);
      const sou8 = new Tile(TileSuit.SOU, 8);
      const sou1 = new Tile(TileSuit.SOU, 1);
      const sou5 = new Tile(TileSuit.SOU, 5);
      const greenDragon = new Tile(TileSuit.HONOR, Dragon.GREEN);
      const whiteDragon = new Tile(TileSuit.HONOR, Dragon.WHITE);

      expect(sou2.isGreen()).toBe(true);
      expect(sou3.isGreen()).toBe(true);
      expect(sou4.isGreen()).toBe(true);
      expect(sou6.isGreen()).toBe(true);
      expect(sou8.isGreen()).toBe(true);
      expect(sou1.isGreen()).toBe(false);
      expect(sou5.isGreen()).toBe(false);
      expect(greenDragon.isGreen()).toBe(true);
      expect(whiteDragon.isGreen()).toBe(false);
    });
  });

  describe('Comparison Methods', () => {
    it('should compare tiles by type and value with equals', () => {
      const tile1 = new Tile(TileSuit.MAN, 5);
      const tile2 = new Tile(TileSuit.MAN, 5);
      const tile3 = new Tile(TileSuit.MAN, 6);
      const tile4 = new Tile(TileSuit.PIN, 5);

      expect(tile1.equals(tile2)).toBe(true);
      expect(tile1.equals(tile3)).toBe(false);
      expect(tile1.equals(tile4)).toBe(false);
    });

    it('should compare red dora tiles correctly', () => {
      const redTile = new Tile(TileSuit.MAN, 5, true);
      const normalTile = new Tile(TileSuit.MAN, 5, false);

      expect(redTile.equals(normalTile)).toBe(false);
    });

    it('should compare tiles by id with isSame', () => {
      const id = 'tile-123';
      const tile1 = new Tile(TileSuit.MAN, 5, false, id);
      const tile2 = new Tile(TileSuit.MAN, 5, false, id);
      const tile3 = new Tile(TileSuit.MAN, 5);

      expect(tile1.isSame(tile2)).toBe(true);
      expect(tile1.isSame(tile3)).toBe(false);
    });
  });

  describe('Navigation Methods', () => {
    it('should get next tile for number tiles', () => {
      const tile = new Tile(TileSuit.MAN, 5);
      const next = tile.next();

      expect(next).not.toBeNull();
      expect(next!.suit).toBe(TileSuit.MAN);
      expect(next!.value).toBe(6);
    });

    it('should return null for next of 9 tile', () => {
      const tile = new Tile(TileSuit.SOU, 9);
      const next = tile.next();

      expect(next).toBeNull();
    });

    it('should return null for next of honor tile', () => {
      const tile = new Tile(TileSuit.HONOR, Wind.EAST);
      const next = tile.next();

      expect(next).toBeNull();
    });

    it('should get previous tile for number tiles', () => {
      const tile = new Tile(TileSuit.PIN, 5);
      const prev = tile.prev();

      expect(prev).not.toBeNull();
      expect(prev!.suit).toBe(TileSuit.PIN);
      expect(prev!.value).toBe(4);
    });

    it('should return null for prev of 1 tile', () => {
      const tile = new Tile(TileSuit.MAN, 1);
      const prev = tile.prev();

      expect(prev).toBeNull();
    });

    it('should return null for prev of honor tile', () => {
      const tile = new Tile(TileSuit.HONOR, Dragon.WHITE);
      const prev = tile.prev();

      expect(prev).toBeNull();
    });
  });

  describe('Utility Methods', () => {
    it('should convert number tiles to string', () => {
      const man5 = new Tile(TileSuit.MAN, 5);
      const pin3 = new Tile(TileSuit.PIN, 3);
      const sou7 = new Tile(TileSuit.SOU, 7);

      expect(man5.toString()).toBe('5萬');
      expect(pin3.toString()).toBe('3筒');
      expect(sou7.toString()).toBe('7索');
    });

    it('should convert red dora to string', () => {
      const redMan5 = new Tile(TileSuit.MAN, 5, true);
      expect(redMan5.toString()).toBe('赤5萬');
    });

    it('should convert honor tiles to string', () => {
      const east = new Tile(TileSuit.HONOR, Wind.EAST);
      const south = new Tile(TileSuit.HONOR, Wind.SOUTH);
      const west = new Tile(TileSuit.HONOR, Wind.WEST);
      const north = new Tile(TileSuit.HONOR, Wind.NORTH);
      const white = new Tile(TileSuit.HONOR, Dragon.WHITE);
      const green = new Tile(TileSuit.HONOR, Dragon.GREEN);
      const red = new Tile(TileSuit.HONOR, Dragon.RED);

      expect(east.toString()).toBe('東');
      expect(south.toString()).toBe('南');
      expect(west.toString()).toBe('西');
      expect(north.toString()).toBe('北');
      expect(white.toString()).toBe('白');
      expect(green.toString()).toBe('發');
      expect(red.toString()).toBe('中');
    });

    it('should generate correct sort keys', () => {
      const man1 = new Tile(TileSuit.MAN, 1);
      const man9 = new Tile(TileSuit.MAN, 9);
      const pin1 = new Tile(TileSuit.PIN, 1);
      const sou1 = new Tile(TileSuit.SOU, 1);
      const honor1 = new Tile(TileSuit.HONOR, 1);

      expect(man1.toSortKey()).toBe(1);
      expect(man9.toSortKey()).toBe(9);
      expect(pin1.toSortKey()).toBe(101);
      expect(sou1.toSortKey()).toBe(201);
      expect(honor1.toSortKey()).toBe(301);
    });

    it('should clone tile correctly', () => {
      const original = new Tile(TileSuit.MAN, 5, true, 'original-id');
      const cloned = original.clone();

      expect(cloned.suit).toBe(original.suit);
      expect(cloned.value).toBe(original.value);
      expect(cloned.isRed).toBe(original.isRed);
      expect(cloned.id).toBe(original.id);
      expect(cloned).not.toBe(original);
    });

    it('should serialize to JSON', () => {
      const tile = new Tile(TileSuit.MAN, 5, true, 'test-id');
      const json = tile.toJSON();

      expect(json).toEqual({
        suit: TileSuit.MAN,
        value: 5,
        isRed: true,
        id: 'test-id',
      });
    });

    it('should deserialize from JSON', () => {
      const json = {
        suit: TileSuit.PIN,
        value: 7,
        isRed: false,
        id: 'json-id',
      };
      const tile = Tile.fromJSON(json);

      expect(tile.suit).toBe(TileSuit.PIN);
      expect(tile.value).toBe(7);
      expect(tile.isRed).toBe(false);
      expect(tile.id).toBe('json-id');
    });
  });
});

describe('TileFactory', () => {
  describe('createStandardSet', () => {
    it('should create 136 tiles without red dora', () => {
      const tiles = TileFactory.createStandardSet(false);
      expect(tiles.length).toBe(136);
    });

    it('should create 136 tiles with red dora', () => {
      const tiles = TileFactory.createStandardSet(true);
      expect(tiles.length).toBe(136);
    });

    it('should have 4 copies of each tile type', () => {
      const tiles = TileFactory.createStandardSet(false);

      // Count man5 tiles
      const man5Count = tiles.filter(t => t.suit === TileSuit.MAN && t.value === 5).length;
      expect(man5Count).toBe(4);

      // Count east wind tiles
      const eastCount = tiles.filter(t => t.suit === TileSuit.HONOR && t.value === Wind.EAST).length;
      expect(eastCount).toBe(4);
    });

    it('should have exactly 3 red dora tiles when enabled', () => {
      const tiles = TileFactory.createStandardSet(true);
      const redTiles = tiles.filter(t => t.isRed);

      expect(redTiles.length).toBe(3);

      // Check red tiles are 5 of each suit
      const redMan = redTiles.filter(t => t.suit === TileSuit.MAN);
      const redPin = redTiles.filter(t => t.suit === TileSuit.PIN);
      const redSou = redTiles.filter(t => t.suit === TileSuit.SOU);

      expect(redMan.length).toBe(1);
      expect(redPin.length).toBe(1);
      expect(redSou.length).toBe(1);

      expect(redMan[0].value).toBe(5);
      expect(redPin[0].value).toBe(5);
      expect(redSou[0].value).toBe(5);
    });

    it('should have correct number of each suit', () => {
      const tiles = TileFactory.createStandardSet(false);

      const manTiles = tiles.filter(t => t.suit === TileSuit.MAN);
      const pinTiles = tiles.filter(t => t.suit === TileSuit.PIN);
      const souTiles = tiles.filter(t => t.suit === TileSuit.SOU);
      const honorTiles = tiles.filter(t => t.suit === TileSuit.HONOR);

      expect(manTiles.length).toBe(36); // 9 values * 4 copies
      expect(pinTiles.length).toBe(36);
      expect(souTiles.length).toBe(36);
      expect(honorTiles.length).toBe(28); // 7 values * 4 copies
    });

    it('should have all unique ids', () => {
      const tiles = TileFactory.createStandardSet(false);
      const ids = tiles.map(t => t.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(136);
    });
  });

  describe('create', () => {
    it('should create a tile with specified properties', () => {
      const tile = TileFactory.create(TileSuit.MAN, 5, true);

      expect(tile.suit).toBe(TileSuit.MAN);
      expect(tile.value).toBe(5);
      expect(tile.isRed).toBe(true);
    });
  });
});
