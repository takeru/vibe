import { Tile } from '../valueObjects/Tile.js';
import { Meld } from '../valueObjects/Meld.js';

/**
 * 手牌の状態
 */
export enum HandStatus {
  /** 門前 */
  CONCEALED = 'concealed',
  /** 副露あり */
  OPEN = 'open',
}

/**
 * 待ちの種類
 */
export enum WaitType {
  /** 両面待ち */
  RYANMEN = 'ryanmen',
  /** 嵌張待ち */
  KANCHAN = 'kanchan',
  /** 辺張待ち */
  PENCHAN = 'penchan',
  /** 単騎待ち */
  TANKI = 'tanki',
  /** 双碰待ち */
  SHANPON = 'shanpon',
  /** 多面待ち */
  MULTIPLE = 'multiple',
}

/**
 * 手牌エンティティ
 */
export class Hand {
  private _concealedTiles: Tile[];
  private _melds: Meld[];
  private _drawnTile: Tile | null;
  private _status: HandStatus;

  constructor() {
    this._concealedTiles = [];
    this._melds = [];
    this._drawnTile = null;
    this._status = HandStatus.CONCEALED;
  }

  /**
   * 牌を追加
   */
  addTile(tile: Tile): void {
    this._concealedTiles.push(tile);
    this.sortTiles();
  }

  /**
   * 牌を削除
   */
  removeTile(tileId: string): Tile | null {
    const index = this._concealedTiles.findIndex(t => t.id === tileId);
    if (index === -1) return null;

    const [removed] = this._concealedTiles.splice(index, 1);
    return removed;
  }

  /**
   * ツモ牌を設定
   */
  setDrawnTile(tile: Tile): void {
    this._drawnTile = tile;
    this._concealedTiles.push(tile);
    this.sortTiles();
  }

  /**
   * ツモ牌をクリア
   */
  clearDrawnTile(): void {
    this._drawnTile = null;
  }

  /**
   * 面子を追加
   */
  addMeld(meld: Meld): void {
    this._melds.push(meld);
    if (meld.isOpen) {
      this._status = HandStatus.OPEN;
    }
  }

  /**
   * 牌をソート
   */
  private sortTiles(): void {
    this._concealedTiles.sort((a, b) => a.toSortKey() - b.toSortKey());
  }

  /**
   * 門前かどうか
   */
  isConcealed(): boolean {
    return this._status === HandStatus.CONCEALED;
  }

  /**
   * 副露しているかどうか
   */
  isOpen(): boolean {
    return this._status === HandStatus.OPEN;
  }

  /**
   * 手牌の枚数を取得（副露を含む）
   */
  getTileCount(): number {
    return this._concealedTiles.length + this._melds.reduce((sum, m) => sum + m.tiles.length, 0);
  }

  /**
   * 手牌の取得
   */
  get concealedTiles(): Tile[] {
    return [...this._concealedTiles]; // 防御的コピー
  }

  /**
   * 副露の取得
   */
  get melds(): Meld[] {
    return [...this._melds]; // 防御的コピー
  }

  /**
   * ツモ牌の取得
   */
  get drawnTile(): Tile | null {
    return this._drawnTile;
  }

  /**
   * 全ての牌を取得（副露含む、表示用）
   */
  getAllTiles(): Tile[] {
    const allTiles = [...this._concealedTiles];
    for (const meld of this._melds) {
      allTiles.push(...meld.tiles);
    }
    return allTiles;
  }

  /**
   * 特定の牌が何枚あるか
   */
  countTile(tile: Tile): number {
    return this._concealedTiles.filter(t => t.equals(tile)).length;
  }

  /**
   * 特定の種類の牌を探す
   */
  findTiles(predicate: (tile: Tile) => boolean): Tile[] {
    return this._concealedTiles.filter(predicate);
  }

  /**
   * チーが可能か判定
   */
  canChi(discardedTile: Tile): boolean {
    if (!this.isConcealed()) return true; // 既に副露している場合は可能
    if (discardedTile.isHonor()) return false; // 字牌はチーできない

    // 順子を作れるパターンをチェック
    const suit = discardedTile.suit;
    const value = discardedTile.value;

    // パターン1: X, X+1, [X+2] のX+2が捨て牌
    // パターン2: X, [X+1], X+2 のX+1が捨て牌
    // パターン3: [X], X+1, X+2 のXが捨て牌

    const patterns = [
      [value - 2, value - 1], // [X], X+1, X+2
      [value - 1, value + 1], // X-1, [X], X+1
      [value + 1, value + 2], // X-1, X, [X+1]
    ];

    for (const [v1, v2] of patterns) {
      if (v1 < 1 || v1 > 9 || v2 < 1 || v2 > 9) continue;

      const hasTile1 = this._concealedTiles.some(t => t.suit === suit && t.value === v1);
      const hasTile2 = this._concealedTiles.some(t => t.suit === suit && t.value === v2);

      if (hasTile1 && hasTile2) return true;
    }

    return false;
  }

  /**
   * ポンが可能か判定
   */
  canPon(discardedTile: Tile): boolean {
    const count = this.countTile(discardedTile);
    return count >= 2;
  }

  /**
   * 明槓が可能か判定
   */
  canMinkan(discardedTile: Tile): boolean {
    const count = this.countTile(discardedTile);
    return count >= 3;
  }

  /**
   * 暗槓が可能か判定
   */
  canAnkan(): Tile[] {
    const tileMap = new Map<string, Tile[]>();

    for (const tile of this._concealedTiles) {
      const key = `${tile.suit}-${tile.value}`;
      if (!tileMap.has(key)) {
        tileMap.set(key, []);
      }
      tileMap.get(key)!.push(tile);
    }

    const ankanTiles: Tile[] = [];
    for (const [_, tiles] of tileMap) {
      if (tiles.length === 4) {
        ankanTiles.push(tiles[0]);
      }
    }

    return ankanTiles;
  }

  /**
   * 加槓が可能か判定
   */
  canKakan(): Array<{ meld: Meld; tile: Tile }> {
    const result: Array<{ meld: Meld; tile: Tile }> = [];

    for (const meld of this._melds) {
      if (meld.type === 'pon') {
        const matchingTile = this._concealedTiles.find(t => t.equals(meld.tiles[0]));
        if (matchingTile) {
          result.push({ meld, tile: matchingTile });
        }
      }
    }

    return result;
  }

  /**
   * 手牌のクローン
   */
  clone(): Hand {
    const cloned = new Hand();
    cloned._concealedTiles = this._concealedTiles.map(t => t.clone());
    cloned._melds = [...this._melds];
    cloned._drawnTile = this._drawnTile?.clone() ?? null;
    cloned._status = this._status;
    return cloned;
  }

  /**
   * シリアライズ
   */
  toJSON(): object {
    return {
      concealedTiles: this._concealedTiles.map(t => t.toJSON()),
      melds: this._melds.map(m => m.toJSON()),
      drawnTile: this._drawnTile?.toJSON(),
      status: this._status,
    };
  }

  /**
   * デシリアライズ
   */
  static fromJSON(json: any): Hand {
    const hand = new Hand();
    hand._concealedTiles = json.concealedTiles.map((t: any) => Tile.fromJSON(t));
    hand._melds = json.melds.map((m: any) => Meld.fromJSON(m));
    hand._drawnTile = json.drawnTile ? Tile.fromJSON(json.drawnTile) : null;
    hand._status = json.status;
    return hand;
  }
}
