/**
 * ゲームタイプ
 */
export enum GameType {
  /** 東風戦（東場のみ） */
  TONPUU = 'tonpuu',
  /** 半荘（東場＋南場） */
  HANCHAN = 'hanchan',
  /** 一荘（東南西北） */
  ICCHAN = 'icchan',
}

/**
 * ゲームルール設定（Value Object）
 */
export class GameRules {
  /** ゲームタイプ */
  readonly gameType: GameType;

  /** 初期持ち点 */
  readonly initialScore: number;

  /** 赤ドラ使用 */
  readonly useRedDora: boolean;

  /** 喰いタン（副露断么九）有効 */
  readonly openTanyao: boolean;

  /** 後付け有効 */
  readonly atozuke: boolean;

  /** 一発有効 */
  readonly ippatsu: boolean;

  /** 裏ドラ有効 */
  readonly uraDora: boolean;

  /** カン裏有効 */
  readonly kanUra: boolean;

  /** カンドラ即乗せ */
  readonly immediateKanDora: boolean;

  /** 割れ目 */
  readonly wareme: boolean;

  /** ダブロン（複数ロン）有効 */
  readonly doubleRon: boolean;

  /** トリプルロン有効 */
  readonly tripleRon: boolean;

  /** 途中流局有効 */
  readonly abortiveDraw: boolean;

  /** 流し満貫有効 */
  readonly nagashiMangan: boolean;

  /** 天和・地和有効 */
  readonly tenhouChiihou: boolean;

  /** 人和有効 */
  readonly renhou: boolean;

  /** 人和を役満扱い */
  readonly renhouAsYakuman: boolean;

  /** 数え役満有効 */
  readonly kazoeYakuman: boolean;

  /** 複数役満 */
  readonly multipleYakuman: boolean;

  /** 切り上げ満貫（4翻30符、3翻60符） */
  readonly kiriage: boolean;

  /** トビ（点数がマイナス）で終了 */
  readonly tobi: boolean;

  /** オーラス（南4局など）の親の連荘 */
  readonly dealerContinuationInLast: boolean;

  /** 西入（南4局終了時にトップが30000点未満で西場突入） */
  readonly westRound: boolean;

  /** 北入 */
  readonly northRound: boolean;

  /** 順位点（ウマ） */
  readonly rankingBonus: {
    first: number;
    second: number;
    third: number;
    fourth: number;
  };

  /** オカ（返し点） */
  readonly oka: number;

  constructor(options: Partial<GameRulesOptions> = {}) {
    // デフォルト設定（一般的な日本ルール）
    this.gameType = options.gameType ?? GameType.HANCHAN;
    this.initialScore = options.initialScore ?? 25000;
    this.useRedDora = options.useRedDora ?? true;
    this.openTanyao = options.openTanyao ?? true;
    this.atozuke = options.atozuke ?? true;
    this.ippatsu = options.ippatsu ?? true;
    this.uraDora = options.uraDora ?? true;
    this.kanUra = options.kanUra ?? true;
    this.immediateKanDora = options.immediateKanDora ?? false;
    this.wareme = options.wareme ?? false;
    this.doubleRon = options.doubleRon ?? true;
    this.tripleRon = options.tripleRon ?? true;
    this.abortiveDraw = options.abortiveDraw ?? true;
    this.nagashiMangan = options.nagashiMangan ?? false;
    this.tenhouChiihou = options.tenhouChiihou ?? true;
    this.renhou = options.renhou ?? false;
    this.renhouAsYakuman = options.renhouAsYakuman ?? false;
    this.kazoeYakuman = options.kazoeYakuman ?? true;
    this.multipleYakuman = options.multipleYakuman ?? true;
    this.kiriage = options.kiriage ?? false;
    this.tobi = options.tobi ?? true;
    this.dealerContinuationInLast = options.dealerContinuationInLast ?? true;
    this.westRound = options.westRound ?? false;
    this.northRound = options.northRound ?? false;
    this.rankingBonus = options.rankingBonus ?? {
      first: 20,
      second: 10,
      third: -10,
      fourth: -20,
    };
    this.oka = options.oka ?? 20; // 25000点→30000点で5000点×4人=20000点
  }

  /**
   * 標準ルール（アリアリ）
   */
  static createStandard(): GameRules {
    return new GameRules({
      openTanyao: true,
      atozuke: true,
    });
  }

  /**
   * 完全先付けルール（ナシナシ）
   */
  static createStrict(): GameRules {
    return new GameRules({
      openTanyao: false,
      atozuke: false,
    });
  }

  /**
   * 三人麻雀ルール
   */
  static createSanma(): GameRules {
    return new GameRules({
      initialScore: 35000,
      // 三麻専用のルール設定
    });
  }

  /**
   * Mリーグルール
   */
  static createMLeague(): GameRules {
    return new GameRules({
      gameType: GameType.HANCHAN,
      initialScore: 25000,
      useRedDora: true,
      openTanyao: true,
      atozuke: true,
      ippatsu: true,
      uraDora: true,
      kanUra: true,
      doubleRon: false, // 頭ハネ
      tripleRon: false,
      abortiveDraw: true,
      tobi: true,
      rankingBonus: {
        first: 30,
        second: 10,
        third: -10,
        fourth: -30,
      },
    });
  }

  /**
   * 天鳳ルール
   */
  static createTenhou(): GameRules {
    return new GameRules({
      gameType: GameType.HANCHAN,
      initialScore: 25000,
      useRedDora: true,
      openTanyao: true,
      atozuke: true,
      doubleRon: true,
      tripleRon: true,
      tobi: false, // 天鳳は飛びなし
    });
  }

  /**
   * シリアライズ
   */
  toJSON(): object {
    return {
      gameType: this.gameType,
      initialScore: this.initialScore,
      useRedDora: this.useRedDora,
      openTanyao: this.openTanyao,
      atozuke: this.atozuke,
      ippatsu: this.ippatsu,
      uraDora: this.uraDora,
      kanUra: this.kanUra,
      immediateKanDora: this.immediateKanDora,
      wareme: this.wareme,
      doubleRon: this.doubleRon,
      tripleRon: this.tripleRon,
      abortiveDraw: this.abortiveDraw,
      nagashiMangan: this.nagashiMangan,
      tenhouChiihou: this.tenhouChiihou,
      renhou: this.renhou,
      renhouAsYakuman: this.renhouAsYakuman,
      kazoeYakuman: this.kazoeYakuman,
      multipleYakuman: this.multipleYakuman,
      kiriage: this.kiriage,
      tobi: this.tobi,
      dealerContinuationInLast: this.dealerContinuationInLast,
      westRound: this.westRound,
      northRound: this.northRound,
      rankingBonus: this.rankingBonus,
      oka: this.oka,
    };
  }

  /**
   * デシリアライズ
   */
  static fromJSON(json: any): GameRules {
    return new GameRules(json);
  }
}

/**
 * ゲームルール設定オプション
 */
export interface GameRulesOptions {
  gameType: GameType;
  initialScore: number;
  useRedDora: boolean;
  openTanyao: boolean;
  atozuke: boolean;
  ippatsu: boolean;
  uraDora: boolean;
  kanUra: boolean;
  immediateKanDora: boolean;
  wareme: boolean;
  doubleRon: boolean;
  tripleRon: boolean;
  abortiveDraw: boolean;
  nagashiMangan: boolean;
  tenhouChiihou: boolean;
  renhou: boolean;
  renhouAsYakuman: boolean;
  kazoeYakuman: boolean;
  multipleYakuman: boolean;
  kiriage: boolean;
  tobi: boolean;
  dealerContinuationInLast: boolean;
  westRound: boolean;
  northRound: boolean;
  rankingBonus: {
    first: number;
    second: number;
    third: number;
    fourth: number;
  };
  oka: number;
}
