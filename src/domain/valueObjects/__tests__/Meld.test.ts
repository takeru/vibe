import { describe, it, expect } from '@jest/globals';
import { Meld, MeldType, KanType, MeldSource, MeldFactory } from '../Meld.js';
import { Tile, TileSuit } from '../Tile.js';

describe('Meld', () => {
  describe('Chi (Sequence) Constructor', () => {
    it('should create a valid chi', () => {
      const tiles = [
        new Tile(TileSuit.MAN, 2),
        new Tile(TileSuit.MAN, 3),
        new Tile(TileSuit.MAN, 4),
      ];
      const calledTile = tiles[1];
      const meld = new Meld(MeldType.CHI, tiles, calledTile, MeldSource.KAMICHA);

      expect(meld.type).toBe(MeldType.CHI);
      expect(meld.tiles.length).toBe(3);
      expect(meld.calledTile).toBe(calledTile);
      expect(meld.source).toBe(MeldSource.KAMICHA);
      expect(meld.isOpen).toBe(true);
    });

    it('should throw error for chi with wrong number of tiles', () => {
      const tiles = [
        new Tile(TileSuit.MAN, 2),
        new Tile(TileSuit.MAN, 3),
      ];
      const calledTile = tiles[0];

      expect(() => new Meld(MeldType.CHI, tiles, calledTile, MeldSource.KAMICHA)).toThrow(
        'Chi must have exactly 3 tiles'
      );
    });

    it('should throw error for chi without called tile', () => {
      const tiles = [
        new Tile(TileSuit.MAN, 2),
        new Tile(TileSuit.MAN, 3),
        new Tile(TileSuit.MAN, 4),
      ];

      expect(() => new Meld(MeldType.CHI, tiles, null, MeldSource.KAMICHA)).toThrow(
        'Chi must have a called tile'
      );
    });

    it('should throw error for chi with non-sequential tiles', () => {
      const tiles = [
        new Tile(TileSuit.MAN, 2),
        new Tile(TileSuit.MAN, 3),
        new Tile(TileSuit.MAN, 5), // Not sequential
      ];
      const calledTile = tiles[0];

      expect(() => new Meld(MeldType.CHI, tiles, calledTile, MeldSource.KAMICHA)).toThrow(
        'Chi tiles must form a valid sequence'
      );
    });

    it('should throw error for chi with honor tiles', () => {
      const tiles = [
        new Tile(TileSuit.HONOR, 1),
        new Tile(TileSuit.HONOR, 2),
        new Tile(TileSuit.HONOR, 3),
      ];
      const calledTile = tiles[0];

      expect(() => new Meld(MeldType.CHI, tiles, calledTile, MeldSource.KAMICHA)).toThrow(
        'Chi tiles must form a valid sequence'
      );
    });

    it('should throw error for chi with mixed suits', () => {
      const tiles = [
        new Tile(TileSuit.MAN, 2),
        new Tile(TileSuit.PIN, 3),
        new Tile(TileSuit.MAN, 4),
      ];
      const calledTile = tiles[0];

      expect(() => new Meld(MeldType.CHI, tiles, calledTile, MeldSource.KAMICHA)).toThrow(
        'Chi tiles must form a valid sequence'
      );
    });
  });

  describe('Pon (Triplet) Constructor', () => {
    it('should create a valid pon', () => {
      const tiles = [
        new Tile(TileSuit.MAN, 5),
        new Tile(TileSuit.MAN, 5),
        new Tile(TileSuit.MAN, 5),
      ];
      const calledTile = tiles[0];
      const meld = new Meld(MeldType.PON, tiles, calledTile, MeldSource.TOIMEN);

      expect(meld.type).toBe(MeldType.PON);
      expect(meld.tiles.length).toBe(3);
      expect(meld.calledTile).toBe(calledTile);
      expect(meld.source).toBe(MeldSource.TOIMEN);
      expect(meld.isOpen).toBe(true);
    });

    it('should throw error for pon with wrong number of tiles', () => {
      const tiles = [
        new Tile(TileSuit.MAN, 5),
        new Tile(TileSuit.MAN, 5),
      ];
      const calledTile = tiles[0];

      expect(() => new Meld(MeldType.PON, tiles, calledTile, MeldSource.TOIMEN)).toThrow(
        'Pon must have exactly 3 tiles'
      );
    });

    it('should throw error for pon without called tile', () => {
      const tiles = [
        new Tile(TileSuit.MAN, 5),
        new Tile(TileSuit.MAN, 5),
        new Tile(TileSuit.MAN, 5),
      ];

      expect(() => new Meld(MeldType.PON, tiles, null, MeldSource.TOIMEN)).toThrow(
        'Pon must have a called tile'
      );
    });

    it('should throw error for pon with non-identical tiles', () => {
      const tiles = [
        new Tile(TileSuit.MAN, 5),
        new Tile(TileSuit.MAN, 5),
        new Tile(TileSuit.MAN, 6), // Different value
      ];
      const calledTile = tiles[0];

      expect(() => new Meld(MeldType.PON, tiles, calledTile, MeldSource.TOIMEN)).toThrow(
        'Pon tiles must be identical'
      );
    });

    it('should create valid pon with honor tiles', () => {
      const tiles = [
        new Tile(TileSuit.HONOR, 1),
        new Tile(TileSuit.HONOR, 1),
        new Tile(TileSuit.HONOR, 1),
      ];
      const calledTile = tiles[0];
      const meld = new Meld(MeldType.PON, tiles, calledTile, MeldSource.SHIMOCHA);

      expect(meld.type).toBe(MeldType.PON);
      expect(meld.tiles.length).toBe(3);
    });
  });

  describe('Kan (Quad) Constructor', () => {
    it('should create a valid minkan', () => {
      const tiles = [
        new Tile(TileSuit.MAN, 7),
        new Tile(TileSuit.MAN, 7),
        new Tile(TileSuit.MAN, 7),
        new Tile(TileSuit.MAN, 7),
      ];
      const calledTile = tiles[0];
      const meld = new Meld(MeldType.KAN, tiles, calledTile, MeldSource.KAMICHA, KanType.MINKAN);

      expect(meld.type).toBe(MeldType.KAN);
      expect(meld.tiles.length).toBe(4);
      expect(meld.kanType).toBe(KanType.MINKAN);
      expect(meld.isOpen).toBe(true);
    });

    it('should create a valid ankan', () => {
      const tiles = [
        new Tile(TileSuit.PIN, 3),
        new Tile(TileSuit.PIN, 3),
        new Tile(TileSuit.PIN, 3),
        new Tile(TileSuit.PIN, 3),
      ];
      const meld = new Meld(MeldType.KAN, tiles, null, MeldSource.SELF, KanType.ANKAN);

      expect(meld.type).toBe(MeldType.KAN);
      expect(meld.kanType).toBe(KanType.ANKAN);
      expect(meld.isClosed).toBe(true);
      expect(meld.isOpen).toBe(false);
    });

    it('should throw error for kan with wrong number of tiles', () => {
      const tiles = [
        new Tile(TileSuit.MAN, 7),
        new Tile(TileSuit.MAN, 7),
        new Tile(TileSuit.MAN, 7),
      ];

      expect(() => new Meld(MeldType.KAN, tiles, null, MeldSource.SELF, KanType.ANKAN)).toThrow(
        'Kan must have exactly 4 tiles'
      );
    });

    it('should throw error for kan without kan type', () => {
      const tiles = [
        new Tile(TileSuit.MAN, 7),
        new Tile(TileSuit.MAN, 7),
        new Tile(TileSuit.MAN, 7),
        new Tile(TileSuit.MAN, 7),
      ];

      expect(() => new Meld(MeldType.KAN, tiles, null, MeldSource.SELF)).toThrow(
        'Kan must specify kan type'
      );
    });

    it('should throw error for kan with non-identical tiles', () => {
      const tiles = [
        new Tile(TileSuit.MAN, 7),
        new Tile(TileSuit.MAN, 7),
        new Tile(TileSuit.MAN, 7),
        new Tile(TileSuit.MAN, 8), // Different value
      ];

      expect(() => new Meld(MeldType.KAN, tiles, null, MeldSource.SELF, KanType.ANKAN)).toThrow(
        'Kan tiles must be identical'
      );
    });
  });

  describe('Type Checking Methods', () => {
    it('should identify sequence correctly', () => {
      const chi = MeldFactory.createChi(
        [
          new Tile(TileSuit.MAN, 2),
          new Tile(TileSuit.MAN, 3),
          new Tile(TileSuit.MAN, 4),
        ],
        new Tile(TileSuit.MAN, 3),
        MeldSource.KAMICHA
      );

      expect(chi.isSequence()).toBe(true);
      expect(chi.isTriplet()).toBe(false);
      expect(chi.isQuad()).toBe(false);
    });

    it('should identify triplet correctly', () => {
      const pon = MeldFactory.createPon(
        [
          new Tile(TileSuit.MAN, 5),
          new Tile(TileSuit.MAN, 5),
          new Tile(TileSuit.MAN, 5),
        ],
        new Tile(TileSuit.MAN, 5),
        MeldSource.TOIMEN
      );

      expect(pon.isSequence()).toBe(false);
      expect(pon.isTriplet()).toBe(true);
      expect(pon.isQuad()).toBe(false);
    });

    it('should identify quad correctly', () => {
      const kan = MeldFactory.createAnkan([
        new Tile(TileSuit.MAN, 7),
        new Tile(TileSuit.MAN, 7),
        new Tile(TileSuit.MAN, 7),
        new Tile(TileSuit.MAN, 7),
      ]);

      expect(kan.isSequence()).toBe(false);
      expect(kan.isTriplet()).toBe(false);
      expect(kan.isQuad()).toBe(true);
    });

    it('should identify concealed kan correctly', () => {
      const ankan = MeldFactory.createAnkan([
        new Tile(TileSuit.MAN, 7),
        new Tile(TileSuit.MAN, 7),
        new Tile(TileSuit.MAN, 7),
        new Tile(TileSuit.MAN, 7),
      ]);

      const minkan = MeldFactory.createMinkan(
        [
          new Tile(TileSuit.MAN, 8),
          new Tile(TileSuit.MAN, 8),
          new Tile(TileSuit.MAN, 8),
          new Tile(TileSuit.MAN, 8),
        ],
        new Tile(TileSuit.MAN, 8),
        MeldSource.KAMICHA
      );

      expect(ankan.isConcealedKan()).toBe(true);
      expect(minkan.isConcealedKan()).toBe(false);
    });
  });

  describe('Defensive Copying', () => {
    it('should return defensive copy of tiles', () => {
      const tiles = [
        new Tile(TileSuit.MAN, 2),
        new Tile(TileSuit.MAN, 3),
        new Tile(TileSuit.MAN, 4),
      ];
      const meld = MeldFactory.createChi(tiles, tiles[0], MeldSource.KAMICHA);

      const getTiles1 = meld.tiles;
      const getTiles2 = meld.tiles;

      expect(getTiles1).not.toBe(getTiles2); // Different array instances
      expect(getTiles1.length).toBe(getTiles2.length);
    });
  });

  describe('Utility Methods', () => {
    it('should get minimum value from meld', () => {
      const chi = MeldFactory.createChi(
        [
          new Tile(TileSuit.MAN, 5),
          new Tile(TileSuit.MAN, 6),
          new Tile(TileSuit.MAN, 7),
        ],
        new Tile(TileSuit.MAN, 5),
        MeldSource.KAMICHA
      );

      expect(chi.getMinValue()).toBe(5);
    });

    it('should convert chi to string', () => {
      const chi = MeldFactory.createChi(
        [
          new Tile(TileSuit.MAN, 2),
          new Tile(TileSuit.MAN, 3),
          new Tile(TileSuit.MAN, 4),
        ],
        new Tile(TileSuit.MAN, 3),
        MeldSource.KAMICHA
      );

      expect(chi.toString()).toBe('チー:2萬3萬4萬');
    });

    it('should convert pon to string', () => {
      const pon = MeldFactory.createPon(
        [
          new Tile(TileSuit.PIN, 5),
          new Tile(TileSuit.PIN, 5),
          new Tile(TileSuit.PIN, 5),
        ],
        new Tile(TileSuit.PIN, 5),
        MeldSource.TOIMEN
      );

      expect(pon.toString()).toBe('ポン:5筒5筒5筒');
    });

    it('should convert kan to string', () => {
      const kan = MeldFactory.createAnkan([
        new Tile(TileSuit.SOU, 7),
        new Tile(TileSuit.SOU, 7),
        new Tile(TileSuit.SOU, 7),
        new Tile(TileSuit.SOU, 7),
      ]);

      expect(kan.toString()).toBe('カン:7索7索7索7索');
    });

    it('should serialize to JSON', () => {
      const tiles = [
        new Tile(TileSuit.MAN, 2, false, 'id1'),
        new Tile(TileSuit.MAN, 3, false, 'id2'),
        new Tile(TileSuit.MAN, 4, false, 'id3'),
      ];
      const calledTile = tiles[1];
      const meld = MeldFactory.createChi(tiles, calledTile, MeldSource.KAMICHA);
      const json = meld.toJSON();

      expect(json).toEqual({
        type: MeldType.CHI,
        tiles: [
          { suit: TileSuit.MAN, value: 2, isRed: false, id: 'id1' },
          { suit: TileSuit.MAN, value: 3, isRed: false, id: 'id2' },
          { suit: TileSuit.MAN, value: 4, isRed: false, id: 'id3' },
        ],
        calledTile: { suit: TileSuit.MAN, value: 3, isRed: false, id: 'id2' },
        source: MeldSource.KAMICHA,
        kanType: undefined,
      });
    });

    it('should deserialize from JSON', () => {
      const json = {
        type: MeldType.PON,
        tiles: [
          { suit: TileSuit.PIN, value: 5, isRed: false, id: 'id1' },
          { suit: TileSuit.PIN, value: 5, isRed: false, id: 'id2' },
          { suit: TileSuit.PIN, value: 5, isRed: false, id: 'id3' },
        ],
        calledTile: { suit: TileSuit.PIN, value: 5, isRed: false, id: 'id1' },
        source: MeldSource.TOIMEN,
        kanType: undefined,
      };

      const meld = Meld.fromJSON(json);

      expect(meld.type).toBe(MeldType.PON);
      expect(meld.tiles.length).toBe(3);
      expect(meld.source).toBe(MeldSource.TOIMEN);
    });
  });
});

describe('MeldFactory', () => {
  describe('createChi', () => {
    it('should create a valid chi', () => {
      const tiles = [
        new Tile(TileSuit.MAN, 3),
        new Tile(TileSuit.MAN, 4),
        new Tile(TileSuit.MAN, 5),
      ];
      const calledTile = tiles[0];
      const meld = MeldFactory.createChi(tiles, calledTile, MeldSource.KAMICHA);

      expect(meld.type).toBe(MeldType.CHI);
      expect(meld.isOpen).toBe(true);
      expect(meld.source).toBe(MeldSource.KAMICHA);
    });
  });

  describe('createPon', () => {
    it('should create a valid pon', () => {
      const tiles = [
        new Tile(TileSuit.SOU, 8),
        new Tile(TileSuit.SOU, 8),
        new Tile(TileSuit.SOU, 8),
      ];
      const calledTile = tiles[0];
      const meld = MeldFactory.createPon(tiles, calledTile, MeldSource.SHIMOCHA);

      expect(meld.type).toBe(MeldType.PON);
      expect(meld.isOpen).toBe(true);
      expect(meld.source).toBe(MeldSource.SHIMOCHA);
    });
  });

  describe('createMinkan', () => {
    it('should create a valid minkan', () => {
      const tiles = [
        new Tile(TileSuit.HONOR, 7),
        new Tile(TileSuit.HONOR, 7),
        new Tile(TileSuit.HONOR, 7),
        new Tile(TileSuit.HONOR, 7),
      ];
      const calledTile = tiles[0];
      const meld = MeldFactory.createMinkan(tiles, calledTile, MeldSource.TOIMEN);

      expect(meld.type).toBe(MeldType.KAN);
      expect(meld.kanType).toBe(KanType.MINKAN);
      expect(meld.isOpen).toBe(true);
      expect(meld.source).toBe(MeldSource.TOIMEN);
    });
  });

  describe('createAnkan', () => {
    it('should create a valid ankan', () => {
      const tiles = [
        new Tile(TileSuit.PIN, 1),
        new Tile(TileSuit.PIN, 1),
        new Tile(TileSuit.PIN, 1),
        new Tile(TileSuit.PIN, 1),
      ];
      const meld = MeldFactory.createAnkan(tiles);

      expect(meld.type).toBe(MeldType.KAN);
      expect(meld.kanType).toBe(KanType.ANKAN);
      expect(meld.isClosed).toBe(true);
      expect(meld.isOpen).toBe(false);
      expect(meld.source).toBe(MeldSource.SELF);
    });
  });

  describe('createKakan', () => {
    it('should create a valid kakan from existing pon', () => {
      const ponTiles = [
        new Tile(TileSuit.MAN, 5),
        new Tile(TileSuit.MAN, 5),
        new Tile(TileSuit.MAN, 5),
      ];
      const pon = MeldFactory.createPon(ponTiles, ponTiles[0], MeldSource.KAMICHA);

      const addedTile = new Tile(TileSuit.MAN, 5);
      const kakan = MeldFactory.createKakan(pon, addedTile);

      expect(kakan.type).toBe(MeldType.KAN);
      expect(kakan.kanType).toBe(KanType.KAKAN);
      expect(kakan.tiles.length).toBe(4);
      expect(kakan.source).toBe(MeldSource.KAMICHA);
      expect(kakan.isOpen).toBe(true);
    });

    it('should throw error when creating kakan from non-pon', () => {
      const chiTiles = [
        new Tile(TileSuit.MAN, 3),
        new Tile(TileSuit.MAN, 4),
        new Tile(TileSuit.MAN, 5),
      ];
      const chi = MeldFactory.createChi(chiTiles, chiTiles[0], MeldSource.KAMICHA);

      const addedTile = new Tile(TileSuit.MAN, 5);

      expect(() => MeldFactory.createKakan(chi, addedTile)).toThrow(
        'Kakan can only be created from an existing pon'
      );
    });
  });
});
