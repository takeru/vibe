import { describe, it, expect } from '@jest/globals';
import { Hand, HandStatus } from '../Hand.js';
import { Tile, TileSuit } from '../../valueObjects/Tile.js';
import { MeldFactory, MeldSource, MeldType } from '../../valueObjects/Meld.js';

describe('Hand', () => {
  describe('Constructor', () => {
    it('should initialize empty hand', () => {
      const hand = new Hand();

      expect(hand.concealedTiles.length).toBe(0);
      expect(hand.melds.length).toBe(0);
      expect(hand.drawnTile).toBeNull();
      expect(hand.isConcealed()).toBe(true);
    });
  });

  describe('Adding and Removing Tiles', () => {
    it('should add tile to hand', () => {
      const hand = new Hand();
      const tile = new Tile(TileSuit.MAN, 5);

      hand.addTile(tile);

      expect(hand.concealedTiles.length).toBe(1);
      expect(hand.concealedTiles[0]).toBe(tile);
    });

    it('should sort tiles when adding', () => {
      const hand = new Hand();
      hand.addTile(new Tile(TileSuit.MAN, 5));
      hand.addTile(new Tile(TileSuit.MAN, 2));
      hand.addTile(new Tile(TileSuit.MAN, 8));

      const tiles = hand.concealedTiles;
      expect(tiles[0].value).toBe(2);
      expect(tiles[1].value).toBe(5);
      expect(tiles[2].value).toBe(8);
    });

    it('should remove tile by id', () => {
      const hand = new Hand();
      const tile1 = new Tile(TileSuit.MAN, 5, false, 'tile1');
      const tile2 = new Tile(TileSuit.MAN, 6, false, 'tile2');

      hand.addTile(tile1);
      hand.addTile(tile2);

      const removed = hand.removeTile('tile1');

      expect(removed).toBe(tile1);
      expect(hand.concealedTiles.length).toBe(1);
      expect(hand.concealedTiles[0]).toBe(tile2);
    });

    it('should return null when removing non-existent tile', () => {
      const hand = new Hand();
      hand.addTile(new Tile(TileSuit.MAN, 5));

      const removed = hand.removeTile('non-existent-id');

      expect(removed).toBeNull();
    });
  });

  describe('Drawn Tile Operations', () => {
    it('should set drawn tile', () => {
      const hand = new Hand();
      const tile = new Tile(TileSuit.MAN, 5);

      hand.setDrawnTile(tile);

      expect(hand.drawnTile).toBe(tile);
      expect(hand.concealedTiles.includes(tile)).toBe(true);
    });

    it('should clear drawn tile', () => {
      const hand = new Hand();
      const tile = new Tile(TileSuit.MAN, 5);

      hand.setDrawnTile(tile);
      hand.clearDrawnTile();

      expect(hand.drawnTile).toBeNull();
    });
  });

  describe('Meld Operations', () => {
    it('should add meld to hand', () => {
      const hand = new Hand();
      const meld = MeldFactory.createPon(
        [
          new Tile(TileSuit.MAN, 5),
          new Tile(TileSuit.MAN, 5),
          new Tile(TileSuit.MAN, 5),
        ],
        new Tile(TileSuit.MAN, 5),
        MeldSource.KAMICHA
      );

      hand.addMeld(meld);

      expect(hand.melds.length).toBe(1);
      expect(hand.melds[0]).toBe(meld);
    });

    it('should change status to open when adding open meld', () => {
      const hand = new Hand();
      const meld = MeldFactory.createPon(
        [
          new Tile(TileSuit.MAN, 5),
          new Tile(TileSuit.MAN, 5),
          new Tile(TileSuit.MAN, 5),
        ],
        new Tile(TileSuit.MAN, 5),
        MeldSource.KAMICHA
      );

      expect(hand.isConcealed()).toBe(true);

      hand.addMeld(meld);

      expect(hand.isConcealed()).toBe(false);
      expect(hand.isOpen()).toBe(true);
    });

    it('should remain concealed when adding ankan', () => {
      const hand = new Hand();
      const ankan = MeldFactory.createAnkan([
        new Tile(TileSuit.MAN, 7),
        new Tile(TileSuit.MAN, 7),
        new Tile(TileSuit.MAN, 7),
        new Tile(TileSuit.MAN, 7),
      ]);

      hand.addMeld(ankan);

      expect(hand.isConcealed()).toBe(true);
    });
  });

  describe('Tile Counting', () => {
    it('should count tiles including melds', () => {
      const hand = new Hand();
      hand.addTile(new Tile(TileSuit.MAN, 1));
      hand.addTile(new Tile(TileSuit.MAN, 2));
      hand.addTile(new Tile(TileSuit.MAN, 3));

      const meld = MeldFactory.createPon(
        [
          new Tile(TileSuit.PIN, 5),
          new Tile(TileSuit.PIN, 5),
          new Tile(TileSuit.PIN, 5),
        ],
        new Tile(TileSuit.PIN, 5),
        MeldSource.KAMICHA
      );
      hand.addMeld(meld);

      expect(hand.getTileCount()).toBe(6); // 3 concealed + 3 in meld
    });

    it('should count specific tile type', () => {
      const hand = new Hand();
      const man5 = new Tile(TileSuit.MAN, 5);

      hand.addTile(man5);
      hand.addTile(new Tile(TileSuit.MAN, 5));
      hand.addTile(new Tile(TileSuit.MAN, 5));
      hand.addTile(new Tile(TileSuit.MAN, 6));

      expect(hand.countTile(man5)).toBe(3);
    });

    it('should get all tiles including melds', () => {
      const hand = new Hand();
      hand.addTile(new Tile(TileSuit.MAN, 1));
      hand.addTile(new Tile(TileSuit.MAN, 2));

      const meld = MeldFactory.createPon(
        [
          new Tile(TileSuit.PIN, 5),
          new Tile(TileSuit.PIN, 5),
          new Tile(TileSuit.PIN, 5),
        ],
        new Tile(TileSuit.PIN, 5),
        MeldSource.KAMICHA
      );
      hand.addMeld(meld);

      const allTiles = hand.getAllTiles();

      expect(allTiles.length).toBe(5);
    });

    it('should find tiles by predicate', () => {
      const hand = new Hand();
      hand.addTile(new Tile(TileSuit.MAN, 1));
      hand.addTile(new Tile(TileSuit.MAN, 5));
      hand.addTile(new Tile(TileSuit.MAN, 9));
      hand.addTile(new Tile(TileSuit.PIN, 5));

      const terminals = hand.findTiles(t => t.isTerminal());

      expect(terminals.length).toBe(2); // 1m and 9m
    });
  });

  describe('canChi', () => {
    it('should allow chi when tiles can form sequence (pattern 1)', () => {
      const hand = new Hand();
      hand.addTile(new Tile(TileSuit.MAN, 2));
      hand.addTile(new Tile(TileSuit.MAN, 3));

      const discarded = new Tile(TileSuit.MAN, 4);

      expect(hand.canChi(discarded)).toBe(true);
    });

    it('should allow chi when tiles can form sequence (pattern 2)', () => {
      const hand = new Hand();
      hand.addTile(new Tile(TileSuit.MAN, 2));
      hand.addTile(new Tile(TileSuit.MAN, 4));

      const discarded = new Tile(TileSuit.MAN, 3);

      expect(hand.canChi(discarded)).toBe(true);
    });

    it('should allow chi when tiles can form sequence (pattern 3)', () => {
      const hand = new Hand();
      hand.addTile(new Tile(TileSuit.MAN, 3));
      hand.addTile(new Tile(TileSuit.MAN, 4));

      const discarded = new Tile(TileSuit.MAN, 2);

      expect(hand.canChi(discarded)).toBe(true);
    });

    it('should not allow chi for honor tiles', () => {
      const hand = new Hand();
      hand.addTile(new Tile(TileSuit.HONOR, 1));
      hand.addTile(new Tile(TileSuit.HONOR, 2));

      const discarded = new Tile(TileSuit.HONOR, 3);

      expect(hand.canChi(discarded)).toBe(false);
    });

    it('should not allow chi when tiles cannot form sequence', () => {
      const hand = new Hand();
      hand.addTile(new Tile(TileSuit.MAN, 2));
      hand.addTile(new Tile(TileSuit.MAN, 5));

      const discarded = new Tile(TileSuit.MAN, 8);

      expect(hand.canChi(discarded)).toBe(false);
    });

    it('should not allow chi at boundaries (8-9-10)', () => {
      const hand = new Hand();
      hand.addTile(new Tile(TileSuit.MAN, 8));
      hand.addTile(new Tile(TileSuit.MAN, 9));

      const discarded = new Tile(TileSuit.MAN, 7); // Would need 8-9-10, but 10 doesn't exist

      expect(hand.canChi(discarded)).toBe(true); // 7-8-9 is valid
    });
  });

  describe('canPon', () => {
    it('should allow pon when having 2 matching tiles', () => {
      const hand = new Hand();
      const man5 = new Tile(TileSuit.MAN, 5);
      hand.addTile(new Tile(TileSuit.MAN, 5));
      hand.addTile(new Tile(TileSuit.MAN, 5));

      expect(hand.canPon(man5)).toBe(true);
    });

    it('should allow pon when having 3 matching tiles', () => {
      const hand = new Hand();
      const man5 = new Tile(TileSuit.MAN, 5);
      hand.addTile(new Tile(TileSuit.MAN, 5));
      hand.addTile(new Tile(TileSuit.MAN, 5));
      hand.addTile(new Tile(TileSuit.MAN, 5));

      expect(hand.canPon(man5)).toBe(true);
    });

    it('should not allow pon when having only 1 matching tile', () => {
      const hand = new Hand();
      const man5 = new Tile(TileSuit.MAN, 5);
      hand.addTile(new Tile(TileSuit.MAN, 5));

      expect(hand.canPon(man5)).toBe(false);
    });

    it('should not allow pon when having no matching tiles', () => {
      const hand = new Hand();
      const man5 = new Tile(TileSuit.MAN, 5);
      hand.addTile(new Tile(TileSuit.MAN, 6));

      expect(hand.canPon(man5)).toBe(false);
    });
  });

  describe('canMinkan', () => {
    it('should allow minkan when having 3 matching tiles', () => {
      const hand = new Hand();
      const man7 = new Tile(TileSuit.MAN, 7);
      hand.addTile(new Tile(TileSuit.MAN, 7));
      hand.addTile(new Tile(TileSuit.MAN, 7));
      hand.addTile(new Tile(TileSuit.MAN, 7));

      expect(hand.canMinkan(man7)).toBe(true);
    });

    it('should not allow minkan when having only 2 matching tiles', () => {
      const hand = new Hand();
      const man7 = new Tile(TileSuit.MAN, 7);
      hand.addTile(new Tile(TileSuit.MAN, 7));
      hand.addTile(new Tile(TileSuit.MAN, 7));

      expect(hand.canMinkan(man7)).toBe(false);
    });
  });

  describe('canAnkan', () => {
    it('should find ankans when having 4 matching tiles', () => {
      const hand = new Hand();
      hand.addTile(new Tile(TileSuit.MAN, 7));
      hand.addTile(new Tile(TileSuit.MAN, 7));
      hand.addTile(new Tile(TileSuit.MAN, 7));
      hand.addTile(new Tile(TileSuit.MAN, 7));

      const ankans = hand.canAnkan();

      expect(ankans.length).toBe(1);
      expect(ankans[0].suit).toBe(TileSuit.MAN);
      expect(ankans[0].value).toBe(7);
    });

    it('should find multiple ankans', () => {
      const hand = new Hand();
      // First ankan
      hand.addTile(new Tile(TileSuit.MAN, 3));
      hand.addTile(new Tile(TileSuit.MAN, 3));
      hand.addTile(new Tile(TileSuit.MAN, 3));
      hand.addTile(new Tile(TileSuit.MAN, 3));
      // Second ankan
      hand.addTile(new Tile(TileSuit.PIN, 5));
      hand.addTile(new Tile(TileSuit.PIN, 5));
      hand.addTile(new Tile(TileSuit.PIN, 5));
      hand.addTile(new Tile(TileSuit.PIN, 5));

      const ankans = hand.canAnkan();

      expect(ankans.length).toBe(2);
    });

    it('should return empty array when no ankans available', () => {
      const hand = new Hand();
      hand.addTile(new Tile(TileSuit.MAN, 7));
      hand.addTile(new Tile(TileSuit.MAN, 7));
      hand.addTile(new Tile(TileSuit.MAN, 7));

      const ankans = hand.canAnkan();

      expect(ankans.length).toBe(0);
    });
  });

  describe('canKakan', () => {
    it('should find kakan when having matching tile for existing pon', () => {
      const hand = new Hand();

      // Add a pon
      const ponMeld = MeldFactory.createPon(
        [
          new Tile(TileSuit.MAN, 5),
          new Tile(TileSuit.MAN, 5),
          new Tile(TileSuit.MAN, 5),
        ],
        new Tile(TileSuit.MAN, 5),
        MeldSource.KAMICHA
      );
      hand.addMeld(ponMeld);

      // Add matching tile to hand
      hand.addTile(new Tile(TileSuit.MAN, 5));

      const kakans = hand.canKakan();

      expect(kakans.length).toBe(1);
      expect(kakans[0].meld).toBe(ponMeld);
      expect(kakans[0].tile.suit).toBe(TileSuit.MAN);
      expect(kakans[0].tile.value).toBe(5);
    });

    it('should not find kakan for chi melds', () => {
      const hand = new Hand();

      const chiMeld = MeldFactory.createChi(
        [
          new Tile(TileSuit.MAN, 3),
          new Tile(TileSuit.MAN, 4),
          new Tile(TileSuit.MAN, 5),
        ],
        new Tile(TileSuit.MAN, 4),
        MeldSource.KAMICHA
      );
      hand.addMeld(chiMeld);

      hand.addTile(new Tile(TileSuit.MAN, 5));

      const kakans = hand.canKakan();

      expect(kakans.length).toBe(0);
    });

    it('should return empty array when no matching tiles for pons', () => {
      const hand = new Hand();

      const ponMeld = MeldFactory.createPon(
        [
          new Tile(TileSuit.MAN, 5),
          new Tile(TileSuit.MAN, 5),
          new Tile(TileSuit.MAN, 5),
        ],
        new Tile(TileSuit.MAN, 5),
        MeldSource.KAMICHA
      );
      hand.addMeld(ponMeld);

      hand.addTile(new Tile(TileSuit.MAN, 6));

      const kakans = hand.canKakan();

      expect(kakans.length).toBe(0);
    });
  });

  describe('Defensive Copying', () => {
    it('should return defensive copy of concealed tiles', () => {
      const hand = new Hand();
      hand.addTile(new Tile(TileSuit.MAN, 5));

      const tiles1 = hand.concealedTiles;
      const tiles2 = hand.concealedTiles;

      expect(tiles1).not.toBe(tiles2);
    });

    it('should return defensive copy of melds', () => {
      const hand = new Hand();
      const meld = MeldFactory.createPon(
        [
          new Tile(TileSuit.MAN, 5),
          new Tile(TileSuit.MAN, 5),
          new Tile(TileSuit.MAN, 5),
        ],
        new Tile(TileSuit.MAN, 5),
        MeldSource.KAMICHA
      );
      hand.addMeld(meld);

      const melds1 = hand.melds;
      const melds2 = hand.melds;

      expect(melds1).not.toBe(melds2);
    });
  });

  describe('Utility Methods', () => {
    it('should clone hand correctly', () => {
      const hand = new Hand();
      hand.addTile(new Tile(TileSuit.MAN, 5));
      hand.addTile(new Tile(TileSuit.PIN, 3));

      const meld = MeldFactory.createPon(
        [
          new Tile(TileSuit.SOU, 7),
          new Tile(TileSuit.SOU, 7),
          new Tile(TileSuit.SOU, 7),
        ],
        new Tile(TileSuit.SOU, 7),
        MeldSource.KAMICHA
      );
      hand.addMeld(meld);

      const drawnTile = new Tile(TileSuit.MAN, 8);
      hand.setDrawnTile(drawnTile);

      const cloned = hand.clone();

      expect(cloned).not.toBe(hand);
      expect(cloned.concealedTiles.length).toBe(hand.concealedTiles.length);
      expect(cloned.melds.length).toBe(hand.melds.length);
      expect(cloned.drawnTile).not.toBeNull();
      expect(cloned.isOpen()).toBe(hand.isOpen());
    });

    it('should serialize to JSON', () => {
      const hand = new Hand();
      hand.addTile(new Tile(TileSuit.MAN, 5, false, 'tile1'));
      hand.addTile(new Tile(TileSuit.PIN, 3, false, 'tile2'));

      const json = hand.toJSON();

      expect(json).toHaveProperty('concealedTiles');
      expect(json).toHaveProperty('melds');
      expect(json).toHaveProperty('drawnTile');
      expect(json).toHaveProperty('status');
    });

    it('should deserialize from JSON', () => {
      const json = {
        concealedTiles: [
          { suit: TileSuit.MAN, value: 5, isRed: false, id: 'tile1' },
          { suit: TileSuit.PIN, value: 3, isRed: false, id: 'tile2' },
        ],
        melds: [],
        drawnTile: null,
        status: HandStatus.CONCEALED,
      };

      const hand = Hand.fromJSON(json);

      expect(hand.concealedTiles.length).toBe(2);
      expect(hand.melds.length).toBe(0);
      expect(hand.drawnTile).toBeNull();
      expect(hand.isConcealed()).toBe(true);
    });
  });
});
