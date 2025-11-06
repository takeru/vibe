import { describe, it, expect } from '@jest/globals';
import { GameRules, GameType } from '../GameRules.js';

describe('GameRules', () => {
  describe('Constructor with defaults', () => {
    it('should create standard rules', () => {
      const rules = new GameRules();

      expect(rules.gameType).toBe(GameType.HANCHAN);
      expect(rules.initialScore).toBe(25000);
      expect(rules.useRedDora).toBe(true);
      expect(rules.openTanyao).toBe(true);
      expect(rules.ippatsu).toBe(true);
      expect(rules.uraDora).toBe(true);
    });

    it('should allow custom options', () => {
      const rules = new GameRules({
        gameType: GameType.TONPUU,
        initialScore: 30000,
        useRedDora: false,
      });

      expect(rules.gameType).toBe(GameType.TONPUU);
      expect(rules.initialScore).toBe(30000);
      expect(rules.useRedDora).toBe(false);
    });
  });

  describe('Preset rules', () => {
    it('should create standard rules preset', () => {
      const rules = GameRules.createStandard();

      expect(rules.gameType).toBe(GameType.HANCHAN);
      expect(rules.initialScore).toBe(25000);
      expect(rules.useRedDora).toBe(true);
      expect(rules.openTanyao).toBe(true);
      expect(rules.atozuke).toBe(true);
      expect(rules.ippatsu).toBe(true);
      expect(rules.uraDora).toBe(true);
      expect(rules.kanUra).toBe(true);
      expect(rules.doubleRon).toBe(true);
      expect(rules.tripleRon).toBe(true);
      expect(rules.kazoeYakuman).toBe(true);
      expect(rules.multipleYakuman).toBe(true);
    });

    it('should create strict rules preset', () => {
      const rules = GameRules.createStrict();

      expect(rules.openTanyao).toBe(false);
      expect(rules.atozuke).toBe(false);
    });

    it('should create M-League rules preset', () => {
      const rules = GameRules.createMLeague();

      expect(rules.gameType).toBe(GameType.HANCHAN);
      expect(rules.initialScore).toBe(25000);
      expect(rules.useRedDora).toBe(true);
      expect(rules.tobi).toBe(true);
      expect(rules.rankingBonus).toEqual({
        first: 30,
        second: 10,
        third: -10,
        fourth: -30,
      });
    });

    it('should create Tenhou rules preset', () => {
      const rules = GameRules.createTenhou();

      expect(rules.gameType).toBe(GameType.HANCHAN);
      expect(rules.useRedDora).toBe(true);
      expect(rules.openTanyao).toBe(true);
      expect(rules.atozuke).toBe(true);
      expect(rules.kazoeYakuman).toBe(true);
      expect(rules.multipleYakuman).toBe(true);
    });
  });

  describe('Game type variations', () => {
    it('should create tonpuu (East-only) game', () => {
      const rules = new GameRules({ gameType: GameType.TONPUU });

      expect(rules.gameType).toBe(GameType.TONPUU);
    });

    it('should create hanchan (East-South) game', () => {
      const rules = new GameRules({ gameType: GameType.HANCHAN });

      expect(rules.gameType).toBe(GameType.HANCHAN);
    });

    it('should create icchan (full) game', () => {
      const rules = new GameRules({ gameType: GameType.ICCHAN });

      expect(rules.gameType).toBe(GameType.ICCHAN);
    });
  });

  describe('Rule options', () => {
    it('should configure red dora usage', () => {
      const withRed = new GameRules({ useRedDora: true });
      const withoutRed = new GameRules({ useRedDora: false });

      expect(withRed.useRedDora).toBe(true);
      expect(withoutRed.useRedDora).toBe(false);
    });

    it('should configure open tanyao', () => {
      const withOpen = new GameRules({ openTanyao: true });
      const withoutOpen = new GameRules({ openTanyao: false });

      expect(withOpen.openTanyao).toBe(true);
      expect(withoutOpen.openTanyao).toBe(false);
    });

    it('should configure atozuke', () => {
      const rules = new GameRules({ atozuke: false });

      expect(rules.atozuke).toBe(false);
    });

    it('should configure ippatsu', () => {
      const rules = new GameRules({ ippatsu: false });

      expect(rules.ippatsu).toBe(false);
    });

    it('should configure ura dora', () => {
      const rules = new GameRules({ uraDora: false });

      expect(rules.uraDora).toBe(false);
    });

    it('should configure multiple yakuman', () => {
      const rules = new GameRules({ multipleYakuman: false });

      expect(rules.multipleYakuman).toBe(false);
    });

    it('should configure ranking bonus', () => {
      const rules = new GameRules({
        rankingBonus: {
          first: 50000,
          second: 10000,
          third: -10000,
          fourth: -50000,
        },
      });

      expect(rules.rankingBonus.first).toBe(50000);
      expect(rules.rankingBonus.second).toBe(10000);
      expect(rules.rankingBonus.third).toBe(-10000);
      expect(rules.rankingBonus.fourth).toBe(-50000);
    });

    it('should configure initial score', () => {
      const rules25k = new GameRules({ initialScore: 25000 });
      const rules30k = new GameRules({ initialScore: 30000 });

      expect(rules25k.initialScore).toBe(25000);
      expect(rules30k.initialScore).toBe(30000);
    });
  });

  describe('Ron variations', () => {
    it('should configure double ron', () => {
      const withDouble = new GameRules({ doubleRon: true });
      const withoutDouble = new GameRules({ doubleRon: false });

      expect(withDouble.doubleRon).toBe(true);
      expect(withoutDouble.doubleRon).toBe(false);
    });

    it('should configure triple ron', () => {
      const withTriple = new GameRules({ tripleRon: true });
      const withoutTriple = new GameRules({ tripleRon: false });

      expect(withTriple.tripleRon).toBe(true);
      expect(withoutTriple.tripleRon).toBe(false);
    });
  });

  describe('Abortive draws', () => {
    it('should configure abortive draw', () => {
      const rules = new GameRules({ abortiveDraw: true });

      expect(rules.abortiveDraw).toBe(true);
    });

    it('should configure nagashi mangan', () => {
      const rules = new GameRules({ nagashiMangan: true });

      expect(rules.nagashiMangan).toBe(true);
    });
  });

  describe('Yakuman variations', () => {
    it('should configure kazoe yakuman', () => {
      const withKazoe = new GameRules({ kazoeYakuman: true });
      const withoutKazoe = new GameRules({ kazoeYakuman: false });

      expect(withKazoe.kazoeYakuman).toBe(true);
      expect(withoutKazoe.kazoeYakuman).toBe(false);
    });

    it('should configure tenhou/chiihou', () => {
      const rules = new GameRules({ tenhouChiihou: true });

      expect(rules.tenhouChiihou).toBe(true);
    });

    it('should configure renhou', () => {
      const rules = new GameRules({ renhou: true, renhouAsYakuman: true });

      expect(rules.renhou).toBe(true);
      expect(rules.renhouAsYakuman).toBe(true);
    });
  });

  describe('Game end conditions', () => {
    it('should configure tobi (bankruptcy)', () => {
      const withTobi = new GameRules({ tobi: true });
      const withoutTobi = new GameRules({ tobi: false });

      expect(withTobi.tobi).toBe(true);
      expect(withoutTobi.tobi).toBe(false);
    });

    it('should configure dealer continuation in last round', () => {
      const rules = new GameRules({ dealerContinuationInLast: true });

      expect(rules.dealerContinuationInLast).toBe(true);
    });

    it('should configure west round extension', () => {
      const rules = new GameRules({ westRound: true });

      expect(rules.westRound).toBe(true);
    });

    it('should configure north round extension', () => {
      const rules = new GameRules({ northRound: true });

      expect(rules.northRound).toBe(true);
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON', () => {
      const rules = GameRules.createStandard();
      const json = rules.toJSON();

      expect(json).toHaveProperty('gameType');
      expect(json).toHaveProperty('initialScore');
      expect(json).toHaveProperty('useRedDora');
      expect(json).toHaveProperty('openTanyao');
    });

    it('should deserialize from JSON', () => {
      const original = GameRules.createMLeague();
      const json = original.toJSON();
      const restored = GameRules.fromJSON(json);

      expect(restored.gameType).toBe(original.gameType);
      expect(restored.initialScore).toBe(original.initialScore);
      expect(restored.useRedDora).toBe(original.useRedDora);
      expect(restored.tobi).toBe(original.tobi);
      expect(restored.rankingBonus).toEqual(original.rankingBonus);
    });

    it('should preserve all settings through serialization', () => {
      const original = new GameRules({
        gameType: GameType.TONPUU,
        initialScore: 30000,
        useRedDora: false,
        openTanyao: false,
        multipleYakuman: false,
        tobi: true,
      });

      const restored = GameRules.fromJSON(original.toJSON());

      expect(restored.gameType).toBe(GameType.TONPUU);
      expect(restored.initialScore).toBe(30000);
      expect(restored.useRedDora).toBe(false);
      expect(restored.openTanyao).toBe(false);
      expect(restored.multipleYakuman).toBe(false);
      expect(restored.tobi).toBe(true);
    });
  });

});

