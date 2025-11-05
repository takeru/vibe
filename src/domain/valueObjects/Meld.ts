import { Tile } from './Tile.js';

/**
 * 面子の種類
 */
export enum MeldType {
  /** 順子 (Sequence) */
  CHI = 'chi',
  /** 刻子 (Triplet) */
  PON = 'pon',
  /** 槓子 (Quad) */
  KAN = 'kan',
}

/**
 * 槓の種類
 */
export enum KanType {
  /** 明槓 (Open Kong) */
  MINKAN = 'minkan',
  /** 暗槓 (Concealed Kong) */
  ANKAN = 'ankan',
  /** 加槓 (Added Kong) */
  KAKAN = 'kakan',
}

/**
 * 副露の元（誰から鳴いたか）
 */
export enum MeldSource {
  /** 上家（左） */
  KAMICHA = 'kamicha',
  /** 対面 */
  TOIMEN = 'toimen',
  /** 下家（右） */
  SHIMOCHA = 'shimocha',
  /** 自分（暗槓） */
  SELF = 'self',
}

/**
 * 面子（副露）Value Object
 */
export class Meld {
  private readonly _type: MeldType;
  private readonly _tiles: Tile[];
  private readonly _calledTile: Tile | null; // 鳴いた牌（ポン・チーの場合）
  private readonly _source: MeldSource;
  private readonly _kanType?: KanType;
  private readonly _isOpen: boolean;

  constructor(
    type: MeldType,
    tiles: Tile[],
    calledTile: Tile | null,
    source: MeldSource,
    kanType?: KanType
  ) {
    this.validate(type, tiles, calledTile, kanType);
    this._type = type;
    this._tiles = [...tiles]; // 防御的コピー
    this._calledTile = calledTile;
    this._source = source;
    this._kanType = kanType;
    this._isOpen = source !== MeldSource.SELF || kanType === KanType.MINKAN;
  }

  private validate(type: MeldType, tiles: Tile[], calledTile: Tile | null, kanType?: KanType): void {
    switch (type) {
      case MeldType.CHI:
        if (tiles.length !== 3) {
          throw new Error('Chi must have exactly 3 tiles');
        }
        if (!this.isValidSequence(tiles)) {
          throw new Error('Chi tiles must form a valid sequence');
        }
        if (!calledTile) {
          throw new Error('Chi must have a called tile');
        }
        break;

      case MeldType.PON:
        if (tiles.length !== 3) {
          throw new Error('Pon must have exactly 3 tiles');
        }
        if (!this.isValidTriplet(tiles)) {
          throw new Error('Pon tiles must be identical');
        }
        if (!calledTile) {
          throw new Error('Pon must have a called tile');
        }
        break;

      case MeldType.KAN:
        if (tiles.length !== 4) {
          throw new Error('Kan must have exactly 4 tiles');
        }
        if (!this.isValidQuad(tiles)) {
          throw new Error('Kan tiles must be identical');
        }
        if (!kanType) {
          throw new Error('Kan must specify kan type');
        }
        break;
    }
  }

  private isValidSequence(tiles: Tile[]): boolean {
    if (tiles.length !== 3) return false;
    const sorted = [...tiles].sort((a, b) => a.value - b.value);

    // 字牌は順子を作れない
    if (sorted[0].isHonor()) return false;

    // 同じスートで連続した数値
    return (
      sorted[0].suit === sorted[1].suit &&
      sorted[1].suit === sorted[2].suit &&
      sorted[1].value === sorted[0].value + 1 &&
      sorted[2].value === sorted[1].value + 1
    );
  }

  private isValidTriplet(tiles: Tile[]): boolean {
    if (tiles.length !== 3) return false;
    return tiles[0].equals(tiles[1]) && tiles[1].equals(tiles[2]);
  }

  private isValidQuad(tiles: Tile[]): boolean {
    if (tiles.length !== 4) return false;
    return (
      tiles[0].equals(tiles[1]) &&
      tiles[1].equals(tiles[2]) &&
      tiles[2].equals(tiles[3])
    );
  }

  get type(): MeldType {
    return this._type;
  }

  get tiles(): Tile[] {
    return [...this._tiles]; // 防御的コピー
  }

  get calledTile(): Tile | null {
    return this._calledTile;
  }

  get source(): MeldSource {
    return this._source;
  }

  get kanType(): KanType | undefined {
    return this._kanType;
  }

  get isOpen(): boolean {
    return this._isOpen;
  }

  get isClosed(): boolean {
    return !this._isOpen;
  }

  /**
   * 順子かどうか
   */
  isSequence(): boolean {
    return this._type === MeldType.CHI;
  }

  /**
   * 刻子かどうか
   */
  isTriplet(): boolean {
    return this._type === MeldType.PON;
  }

  /**
   * 槓子かどうか
   */
  isQuad(): boolean {
    return this._type === MeldType.KAN;
  }

  /**
   * 暗槓かどうか
   */
  isConcealedKan(): boolean {
    return this._type === MeldType.KAN && this._kanType === KanType.ANKAN;
  }

  /**
   * 面子の最小値を取得
   */
  getMinValue(): number {
    return Math.min(...this._tiles.map(t => t.value));
  }

  /**
   * 文字列表現
   */
  toString(): string {
    const tilesStr = this._tiles.map(t => t.toString()).join('');
    const typeStr = this._type === MeldType.CHI ? 'チー' :
                    this._type === MeldType.PON ? 'ポン' : 'カン';
    return `${typeStr}:${tilesStr}`;
  }

  /**
   * シリアライズ
   */
  toJSON(): object {
    return {
      type: this._type,
      tiles: this._tiles.map(t => t.toJSON()),
      calledTile: this._calledTile?.toJSON(),
      source: this._source,
      kanType: this._kanType,
    };
  }

  /**
   * デシリアライズ
   */
  static fromJSON(json: any): Meld {
    return new Meld(
      json.type,
      json.tiles.map((t: any) => Tile.fromJSON(t)),
      json.calledTile ? Tile.fromJSON(json.calledTile) : null,
      json.source,
      json.kanType
    );
  }
}

/**
 * 面子のファクトリー
 */
export class MeldFactory {
  /**
   * チーを作成
   */
  static createChi(tiles: Tile[], calledTile: Tile, source: MeldSource): Meld {
    return new Meld(MeldType.CHI, tiles, calledTile, source);
  }

  /**
   * ポンを作成
   */
  static createPon(tiles: Tile[], calledTile: Tile, source: MeldSource): Meld {
    return new Meld(MeldType.PON, tiles, calledTile, source);
  }

  /**
   * 明槓を作成
   */
  static createMinkan(tiles: Tile[], calledTile: Tile, source: MeldSource): Meld {
    return new Meld(MeldType.KAN, tiles, calledTile, source, KanType.MINKAN);
  }

  /**
   * 暗槓を作成
   */
  static createAnkan(tiles: Tile[]): Meld {
    return new Meld(MeldType.KAN, tiles, null, MeldSource.SELF, KanType.ANKAN);
  }

  /**
   * 加槓を作成（既存のポンに牌を追加）
   */
  static createKakan(existingPon: Meld, addedTile: Tile): Meld {
    if (existingPon.type !== MeldType.PON) {
      throw new Error('Kakan can only be created from an existing pon');
    }
    const tiles = [...existingPon.tiles, addedTile];
    return new Meld(MeldType.KAN, tiles, existingPon.calledTile, existingPon.source, KanType.KAKAN);
  }
}
