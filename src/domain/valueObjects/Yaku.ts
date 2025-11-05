/**
 * 役の種類
 */
export enum YakuType {
  // 1翻役
  RIICHI = 'riichi',                        // 立直
  IPPATSU = 'ippatsu',                      // 一発
  TSUMO = 'tsumo',                          // 門前清自摸和
  TANYAO = 'tanyao',                        // 断么九
  PINFU = 'pinfu',                          // 平和
  IIPEIKOU = 'iipeikou',                    // 一盃口
  HAITEI = 'haitei',                        // 海底摸月
  HOUTEI = 'houtei',                        // 河底撈魚
  RINSHAN = 'rinshan',                      // 嶺上開花
  CHANKAN = 'chankan',                      // 槍槓
  YAKUHAI_PLACE = 'yakuhai_place',          // 役牌（場風）
  YAKUHAI_SEAT = 'yakuhai_seat',            // 役牌（自風）
  YAKUHAI_DRAGON_WHITE = 'yakuhai_white',   // 役牌（白）
  YAKUHAI_DRAGON_GREEN = 'yakuhai_green',   // 役牌（發）
  YAKUHAI_DRAGON_RED = 'yakuhai_red',       // 役牌（中）

  // 2翻役
  DOUBLE_RIICHI = 'double_riichi',          // 両立直
  SANSHOKU_DOUJUN = 'sanshoku_doujun',      // 三色同順
  SANSHOKU_DOUKOU = 'sanshoku_doukou',      // 三色同刻
  ITTSU = 'ittsu',                          // 一気通貫
  CHANTAI = 'chantai',                      // 混全帯么九
  TOITOI = 'toitoi',                        // 対々和
  SANANKOU = 'sanankou',                    // 三暗刻
  SANKANTSU = 'sankantsu',                  // 三槓子
  CHIITOITSU = 'chiitoitsu',                // 七対子
  HONROUTOU = 'honroutou',                  // 混老頭
  SHOUSANGEN = 'shousangen',                // 小三元

  // 3翻役
  RYANPEIKOU = 'ryanpeikou',                // 二盃口
  JUNCHAN = 'junchan',                      // 純全帯么九
  HONITSU = 'honitsu',                      // 混一色

  // 6翻役
  CHINITSU = 'chinitsu',                    // 清一色

  // 役満
  KOKUSHI = 'kokushi',                      // 国士無双
  KOKUSHI_13 = 'kokushi_13',                // 国士無双十三面待ち
  SUUANKOU = 'suuankou',                    // 四暗刻
  SUUANKOU_TANKI = 'suuankou_tanki',        // 四暗刻単騎待ち
  DAISANGEN = 'daisangen',                  // 大三元
  SHOUSUUSHII = 'shousuushii',              // 小四喜
  DAISUUSHII = 'daisuushii',                // 大四喜
  TSUUIISOU = 'tsuuiisou',                  // 字一色
  CHINROUTOU = 'chinroutou',                // 清老頭
  RYUUIISOU = 'ryuuiisou',                  // 緑一色
  CHUUREN = 'chuuren',                      // 九蓮宝燈
  CHUUREN_9 = 'chuuren_9',                  // 純正九蓮宝燈
  SUUKANTSU = 'suukantsu',                  // 四槓子
  TENHOU = 'tenhou',                        // 天和
  CHIIHOU = 'chiihou',                      // 地和

  // ドラ
  DORA = 'dora',                            // ドラ
  URADORA = 'uradora',                      // 裏ドラ
  AKADORA = 'akadora',                      // 赤ドラ
}

/**
 * 役の定義
 */
export interface YakuDefinition {
  type: YakuType;
  name: string;
  nameEn: string;
  han: number;
  isYakuman: boolean;
  isDoubleYakuman?: boolean;
  requiresConcealed?: boolean;
  openHandPenalty?: number; // 食い下がり（副露時の翻数減少）
}

/**
 * 役の定義マップ
 */
export const YAKU_DEFINITIONS: Record<YakuType, YakuDefinition> = {
  [YakuType.RIICHI]: {
    type: YakuType.RIICHI,
    name: '立直',
    nameEn: 'Riichi',
    han: 1,
    isYakuman: false,
    requiresConcealed: true,
  },
  [YakuType.IPPATSU]: {
    type: YakuType.IPPATSU,
    name: '一発',
    nameEn: 'Ippatsu',
    han: 1,
    isYakuman: false,
    requiresConcealed: true,
  },
  [YakuType.TSUMO]: {
    type: YakuType.TSUMO,
    name: '門前清自摸和',
    nameEn: 'Menzen Tsumo',
    han: 1,
    isYakuman: false,
    requiresConcealed: true,
  },
  [YakuType.TANYAO]: {
    type: YakuType.TANYAO,
    name: '断么九',
    nameEn: 'Tanyao',
    han: 1,
    isYakuman: false,
  },
  [YakuType.PINFU]: {
    type: YakuType.PINFU,
    name: '平和',
    nameEn: 'Pinfu',
    han: 1,
    isYakuman: false,
    requiresConcealed: true,
  },
  [YakuType.IIPEIKOU]: {
    type: YakuType.IIPEIKOU,
    name: '一盃口',
    nameEn: 'Iipeikou',
    han: 1,
    isYakuman: false,
    requiresConcealed: true,
  },
  [YakuType.HAITEI]: {
    type: YakuType.HAITEI,
    name: '海底摸月',
    nameEn: 'Haitei',
    han: 1,
    isYakuman: false,
  },
  [YakuType.HOUTEI]: {
    type: YakuType.HOUTEI,
    name: '河底撈魚',
    nameEn: 'Houtei',
    han: 1,
    isYakuman: false,
  },
  [YakuType.RINSHAN]: {
    type: YakuType.RINSHAN,
    name: '嶺上開花',
    nameEn: 'Rinshan',
    han: 1,
    isYakuman: false,
  },
  [YakuType.CHANKAN]: {
    type: YakuType.CHANKAN,
    name: '槍槓',
    nameEn: 'Chankan',
    han: 1,
    isYakuman: false,
  },
  [YakuType.YAKUHAI_PLACE]: {
    type: YakuType.YAKUHAI_PLACE,
    name: '役牌（場風）',
    nameEn: 'Yakuhai (Place Wind)',
    han: 1,
    isYakuman: false,
  },
  [YakuType.YAKUHAI_SEAT]: {
    type: YakuType.YAKUHAI_SEAT,
    name: '役牌（自風）',
    nameEn: 'Yakuhai (Seat Wind)',
    han: 1,
    isYakuman: false,
  },
  [YakuType.YAKUHAI_DRAGON_WHITE]: {
    type: YakuType.YAKUHAI_DRAGON_WHITE,
    name: '役牌（白）',
    nameEn: 'Yakuhai (White Dragon)',
    han: 1,
    isYakuman: false,
  },
  [YakuType.YAKUHAI_DRAGON_GREEN]: {
    type: YakuType.YAKUHAI_DRAGON_GREEN,
    name: '役牌（發）',
    nameEn: 'Yakuhai (Green Dragon)',
    han: 1,
    isYakuman: false,
  },
  [YakuType.YAKUHAI_DRAGON_RED]: {
    type: YakuType.YAKUHAI_DRAGON_RED,
    name: '役牌（中）',
    nameEn: 'Yakuhai (Red Dragon)',
    han: 1,
    isYakuman: false,
  },
  [YakuType.DOUBLE_RIICHI]: {
    type: YakuType.DOUBLE_RIICHI,
    name: '両立直',
    nameEn: 'Double Riichi',
    han: 2,
    isYakuman: false,
    requiresConcealed: true,
  },
  [YakuType.SANSHOKU_DOUJUN]: {
    type: YakuType.SANSHOKU_DOUJUN,
    name: '三色同順',
    nameEn: 'Sanshoku Doujun',
    han: 2,
    isYakuman: false,
    openHandPenalty: 1,
  },
  [YakuType.SANSHOKU_DOUKOU]: {
    type: YakuType.SANSHOKU_DOUKOU,
    name: '三色同刻',
    nameEn: 'Sanshoku Doukou',
    han: 2,
    isYakuman: false,
  },
  [YakuType.ITTSU]: {
    type: YakuType.ITTSU,
    name: '一気通貫',
    nameEn: 'Ittsu',
    han: 2,
    isYakuman: false,
    openHandPenalty: 1,
  },
  [YakuType.CHANTAI]: {
    type: YakuType.CHANTAI,
    name: '混全帯么九',
    nameEn: 'Chantai',
    han: 2,
    isYakuman: false,
    openHandPenalty: 1,
  },
  [YakuType.TOITOI]: {
    type: YakuType.TOITOI,
    name: '対々和',
    nameEn: 'Toitoi',
    han: 2,
    isYakuman: false,
  },
  [YakuType.SANANKOU]: {
    type: YakuType.SANANKOU,
    name: '三暗刻',
    nameEn: 'Sanankou',
    han: 2,
    isYakuman: false,
  },
  [YakuType.SANKANTSU]: {
    type: YakuType.SANKANTSU,
    name: '三槓子',
    nameEn: 'Sankantsu',
    han: 2,
    isYakuman: false,
  },
  [YakuType.CHIITOITSU]: {
    type: YakuType.CHIITOITSU,
    name: '七対子',
    nameEn: 'Chiitoitsu',
    han: 2,
    isYakuman: false,
    requiresConcealed: true,
  },
  [YakuType.HONROUTOU]: {
    type: YakuType.HONROUTOU,
    name: '混老頭',
    nameEn: 'Honroutou',
    han: 2,
    isYakuman: false,
  },
  [YakuType.SHOUSANGEN]: {
    type: YakuType.SHOUSANGEN,
    name: '小三元',
    nameEn: 'Shousangen',
    han: 2,
    isYakuman: false,
  },
  [YakuType.RYANPEIKOU]: {
    type: YakuType.RYANPEIKOU,
    name: '二盃口',
    nameEn: 'Ryanpeikou',
    han: 3,
    isYakuman: false,
    requiresConcealed: true,
  },
  [YakuType.JUNCHAN]: {
    type: YakuType.JUNCHAN,
    name: '純全帯么九',
    nameEn: 'Junchan',
    han: 3,
    isYakuman: false,
    openHandPenalty: 1,
  },
  [YakuType.HONITSU]: {
    type: YakuType.HONITSU,
    name: '混一色',
    nameEn: 'Honitsu',
    han: 3,
    isYakuman: false,
    openHandPenalty: 1,
  },
  [YakuType.CHINITSU]: {
    type: YakuType.CHINITSU,
    name: '清一色',
    nameEn: 'Chinitsu',
    han: 6,
    isYakuman: false,
    openHandPenalty: 1,
  },
  [YakuType.KOKUSHI]: {
    type: YakuType.KOKUSHI,
    name: '国士無双',
    nameEn: 'Kokushi Musou',
    han: 13,
    isYakuman: true,
    requiresConcealed: true,
  },
  [YakuType.KOKUSHI_13]: {
    type: YakuType.KOKUSHI_13,
    name: '国士無双十三面待ち',
    nameEn: 'Kokushi Musou 13-wait',
    han: 26,
    isYakuman: true,
    isDoubleYakuman: true,
    requiresConcealed: true,
  },
  [YakuType.SUUANKOU]: {
    type: YakuType.SUUANKOU,
    name: '四暗刻',
    nameEn: 'Suuankou',
    han: 13,
    isYakuman: true,
    requiresConcealed: true,
  },
  [YakuType.SUUANKOU_TANKI]: {
    type: YakuType.SUUANKOU_TANKI,
    name: '四暗刻単騎',
    nameEn: 'Suuankou Tanki',
    han: 26,
    isYakuman: true,
    isDoubleYakuman: true,
    requiresConcealed: true,
  },
  [YakuType.DAISANGEN]: {
    type: YakuType.DAISANGEN,
    name: '大三元',
    nameEn: 'Daisangen',
    han: 13,
    isYakuman: true,
  },
  [YakuType.SHOUSUUSHII]: {
    type: YakuType.SHOUSUUSHII,
    name: '小四喜',
    nameEn: 'Shousuushii',
    han: 13,
    isYakuman: true,
  },
  [YakuType.DAISUUSHII]: {
    type: YakuType.DAISUUSHII,
    name: '大四喜',
    nameEn: 'Daisuushii',
    han: 26,
    isYakuman: true,
    isDoubleYakuman: true,
  },
  [YakuType.TSUUIISOU]: {
    type: YakuType.TSUUIISOU,
    name: '字一色',
    nameEn: 'Tsuuiisou',
    han: 13,
    isYakuman: true,
  },
  [YakuType.CHINROUTOU]: {
    type: YakuType.CHINROUTOU,
    name: '清老頭',
    nameEn: 'Chinroutou',
    han: 13,
    isYakuman: true,
  },
  [YakuType.RYUUIISOU]: {
    type: YakuType.RYUUIISOU,
    name: '緑一色',
    nameEn: 'Ryuuiisou',
    han: 13,
    isYakuman: true,
  },
  [YakuType.CHUUREN]: {
    type: YakuType.CHUUREN,
    name: '九蓮宝燈',
    nameEn: 'Chuuren Poutou',
    han: 13,
    isYakuman: true,
    requiresConcealed: true,
  },
  [YakuType.CHUUREN_9]: {
    type: YakuType.CHUUREN_9,
    name: '純正九蓮宝燈',
    nameEn: 'Junsei Chuuren Poutou',
    han: 26,
    isYakuman: true,
    isDoubleYakuman: true,
    requiresConcealed: true,
  },
  [YakuType.SUUKANTSU]: {
    type: YakuType.SUUKANTSU,
    name: '四槓子',
    nameEn: 'Suukantsu',
    han: 13,
    isYakuman: true,
  },
  [YakuType.TENHOU]: {
    type: YakuType.TENHOU,
    name: '天和',
    nameEn: 'Tenhou',
    han: 13,
    isYakuman: true,
    requiresConcealed: true,
  },
  [YakuType.CHIIHOU]: {
    type: YakuType.CHIIHOU,
    name: '地和',
    nameEn: 'Chiihou',
    han: 13,
    isYakuman: true,
    requiresConcealed: true,
  },
  [YakuType.DORA]: {
    type: YakuType.DORA,
    name: 'ドラ',
    nameEn: 'Dora',
    han: 1,
    isYakuman: false,
  },
  [YakuType.URADORA]: {
    type: YakuType.URADORA,
    name: '裏ドラ',
    nameEn: 'Ura Dora',
    han: 1,
    isYakuman: false,
  },
  [YakuType.AKADORA]: {
    type: YakuType.AKADORA,
    name: '赤ドラ',
    nameEn: 'Aka Dora',
    han: 1,
    isYakuman: false,
  },
};

/**
 * 役のインスタンス
 */
export class Yaku {
  private readonly _type: YakuType;
  private readonly _han: number;

  constructor(type: YakuType, han?: number) {
    const definition = YAKU_DEFINITIONS[type];
    this._type = type;
    this._han = han ?? definition.han;
  }

  get type(): YakuType {
    return this._type;
  }

  get han(): number {
    return this._han;
  }

  get definition(): YakuDefinition {
    return YAKU_DEFINITIONS[this._type];
  }

  get name(): string {
    return this.definition.name;
  }

  get isYakuman(): boolean {
    return this.definition.isYakuman;
  }

  toString(): string {
    return `${this.name} (${this.han}翻)`;
  }
}
