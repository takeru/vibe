/**
 * 牌の種類
 */
export enum TileSuit {
  /** 萬子 (Characters) */
  MAN = 'man',
  /** 筒子 (Dots) */
  PIN = 'pin',
  /** 索子 (Bamboo) */
  SOU = 'sou',
  /** 字牌 (Honors) */
  HONOR = 'honor',
}

/**
 * 風牌
 */
export enum Wind {
  EAST = 1,   // 東
  SOUTH = 2,  // 南
  WEST = 3,   // 西
  NORTH = 4,  // 北
}

/**
 * 三元牌
 */
export enum Dragon {
  WHITE = 5,  // 白
  GREEN = 6,  // 發
  RED = 7,    // 中
}

/**
 * 牌（Value Object）
 * 不変オブジェクトとして扱う
 */
export class Tile {
  private readonly _suit: TileSuit;
  private readonly _value: number;
  private readonly _isRed: boolean; // 赤ドラフラグ
  private readonly _id: string;

  constructor(suit: TileSuit, value: number, isRed: boolean = false, id?: string) {
    this.validateTile(suit, value, isRed);
    this._suit = suit;
    this._value = value;
    this._isRed = isRed;
    this._id = id ?? `${suit}-${value}${isRed ? '-red' : ''}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private validateTile(suit: TileSuit, value: number, isRed: boolean): void {
    if (suit === TileSuit.HONOR) {
      if (value < 1 || value > 7) {
        throw new Error(`Invalid honor tile value: ${value}. Must be 1-7.`);
      }
      if (isRed) {
        throw new Error('Honor tiles cannot be red dora');
      }
    } else {
      if (value < 1 || value > 9) {
        throw new Error(`Invalid number tile value: ${value}. Must be 1-9.`);
      }
      if (isRed && value !== 5) {
        throw new Error('Only 5 tiles can be red dora');
      }
    }
  }

  get suit(): TileSuit {
    return this._suit;
  }

  get value(): number {
    return this._value;
  }

  get isRed(): boolean {
    return this._isRed;
  }

  get id(): string {
    return this._id;
  }

  /**
   * 数牌かどうか
   */
  isNumber(): boolean {
    return this._suit !== TileSuit.HONOR;
  }

  /**
   * 字牌かどうか
   */
  isHonor(): boolean {
    return this._suit === TileSuit.HONOR;
  }

  /**
   * 風牌かどうか
   */
  isWind(): boolean {
    return this._suit === TileSuit.HONOR && this._value >= 1 && this._value <= 4;
  }

  /**
   * 三元牌かどうか
   */
  isDragon(): boolean {
    return this._suit === TileSuit.HONOR && this._value >= 5 && this._value <= 7;
  }

  /**
   * 么九牌（1,9,字牌）かどうか
   */
  isTerminal(): boolean {
    return (this.isNumber() && (this._value === 1 || this._value === 9)) || this.isHonor();
  }

  /**
   * 老頭牌（1,9）かどうか
   */
  isTerminalNumber(): boolean {
    return this.isNumber() && (this._value === 1 || this._value === 9);
  }

  /**
   * 中張牌（2-8）かどうか
   */
  isSimple(): boolean {
    return this.isNumber() && this._value >= 2 && this._value <= 8;
  }

  /**
   * 緑一色の緑牌かどうか（2,3,4,6,8索と發）
   */
  isGreen(): boolean {
    if (this._suit === TileSuit.SOU && [2, 3, 4, 6, 8].includes(this._value)) {
      return true;
    }
    return this._suit === TileSuit.HONOR && this._value === Dragon.GREEN;
  }

  /**
   * 牌の同一性判定（種類と数値のみ、IDは除外）
   */
  equals(other: Tile): boolean {
    return (
      this._suit === other._suit &&
      this._value === other._value &&
      this._isRed === other._isRed
    );
  }

  /**
   * 牌のIDによる同一性判定
   */
  isSame(other: Tile): boolean {
    return this._id === other._id;
  }

  /**
   * 次の牌を取得（順子判定用）
   */
  next(): Tile | null {
    if (this.isHonor() || this._value === 9) {
      return null;
    }
    return new Tile(this._suit, this._value + 1);
  }

  /**
   * 前の牌を取得（順子判定用）
   */
  prev(): Tile | null {
    if (this.isHonor() || this._value === 1) {
      return null;
    }
    return new Tile(this._suit, this._value - 1);
  }

  /**
   * 牌を文字列表現に変換
   */
  toString(): string {
    if (this._suit === TileSuit.HONOR) {
      const honorNames: Record<number, string> = {
        1: '東', 2: '南', 3: '西', 4: '北',
        5: '白', 6: '發', 7: '中',
      };
      return honorNames[this._value];
    }

    const suitChar = this._suit === TileSuit.MAN ? '萬' :
                     this._suit === TileSuit.PIN ? '筒' : '索';
    const prefix = this._isRed ? '赤' : '';
    return `${prefix}${this._value}${suitChar}`;
  }

  /**
   * ソート用のキー
   */
  toSortKey(): number {
    const suitBase = {
      [TileSuit.MAN]: 0,
      [TileSuit.PIN]: 100,
      [TileSuit.SOU]: 200,
      [TileSuit.HONOR]: 300,
    };
    return suitBase[this._suit] + this._value;
  }

  /**
   * 牌のクローン
   */
  clone(): Tile {
    return new Tile(this._suit, this._value, this._isRed, this._id);
  }

  /**
   * 牌をシリアライズ
   */
  toJSON(): object {
    return {
      suit: this._suit,
      value: this._value,
      isRed: this._isRed,
      id: this._id,
    };
  }

  /**
   * JSONから牌を復元
   */
  static fromJSON(json: any): Tile {
    return new Tile(json.suit, json.value, json.isRed, json.id);
  }
}

/**
 * 牌のファクトリー関数
 */
export class TileFactory {
  /**
   * 標準の136枚の牌セットを作成
   */
  static createStandardSet(useRedDora: boolean = false): Tile[] {
    const tiles: Tile[] = [];

    // 数牌（萬子、筒子、索子）各1-9を4枚ずつ
    const numberSuits = [TileSuit.MAN, TileSuit.PIN, TileSuit.SOU];
    for (const suit of numberSuits) {
      for (let value = 1; value <= 9; value++) {
        for (let copy = 0; copy < 4; copy++) {
          // 赤ドラ: 各スートの5の1枚目を赤にする
          const isRed = useRedDora && value === 5 && copy === 0;
          tiles.push(new Tile(suit, value, isRed));
        }
      }
    }

    // 字牌（東南西北白發中）各4枚
    for (let value = 1; value <= 7; value++) {
      for (let copy = 0; copy < 4; copy++) {
        tiles.push(new Tile(TileSuit.HONOR, value));
      }
    }

    return tiles;
  }

  /**
   * 特定の牌を作成
   */
  static create(suit: TileSuit, value: number, isRed: boolean = false): Tile {
    return new Tile(suit, value, isRed);
  }

  /**
   * 文字列から牌を作成（例: "1m", "5pr", "東"）
   */
  static fromString(str: string): Tile {
    // 実装は省略（文字列パーサー）
    throw new Error('Not implemented');
  }
}
