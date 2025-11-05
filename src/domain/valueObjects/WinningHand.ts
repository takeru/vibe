import { Tile } from './Tile.js';
import { Meld, MeldType } from './Meld.js';
import { Yaku } from './Yaku.js';

/**
 * 和了の種類
 */
export enum WinType {
  /** ツモ和了 */
  TSUMO = 'tsumo',
  /** ロン和了 */
  RON = 'ron',
}

/**
 * 面子の組み合わせ（4面子1雀頭）
 */
export interface MeldSet {
  /** 刻子・順子 */
  groups: Tile[][];
  /** 雀頭（対子） */
  pair: Tile[];
}

/**
 * 和了形
 */
export class WinningHand {
  private readonly _tiles: Tile[];
  private readonly _melds: Meld[];
  private readonly _winningTile: Tile;
  private readonly _winType: WinType;
  private readonly _meldSets: MeldSet[];

  constructor(
    tiles: Tile[],
    melds: Meld[],
    winningTile: Tile,
    winType: WinType
  ) {
    this._tiles = tiles;
    this._melds = melds;
    this._winningTile = winningTile;
    this._winType = winType;
    this._meldSets = this.findAllMeldSets();
  }

  /**
   * 全ての面子構成を探索
   */
  private findAllMeldSets(): MeldSet[] {
    const concealedTiles = [...this._tiles];
    const sets: MeldSet[] = [];

    // 七対子の判定
    if (this._melds.length === 0 && this.isChiitoitsu(concealedTiles)) {
      // 七対子は特殊な形なので別処理
      return [];
    }

    // 通常の4面子1雀頭を探索
    this.searchMeldSets(concealedTiles, [], null, sets);

    return sets;
  }

  /**
   * 七対子判定
   */
  private isChiitoitsu(tiles: Tile[]): boolean {
    if (tiles.length !== 14) return false;

    const sorted = [...tiles].sort((a, b) => a.toSortKey() - b.toSortKey());
    const pairs = new Set<string>();

    for (let i = 0; i < sorted.length; i += 2) {
      if (!sorted[i].equals(sorted[i + 1])) {
        return false;
      }
      const key = `${sorted[i].suit}-${sorted[i].value}`;
      if (pairs.has(key)) {
        return false; // 同じ対子が2つある（四枚使い）
      }
      pairs.add(key);
    }

    return true;
  }

  /**
   * 面子構成を再帰的に探索
   */
  private searchMeldSets(
    remaining: Tile[],
    groups: Tile[][],
    pair: Tile[] | null,
    results: MeldSet[]
  ): void {
    // 副露がある場合は、それを考慮
    const totalGroups = groups.length + this._melds.length;

    // 完成条件: 4面子1雀頭
    if (totalGroups === 4 && pair !== null && remaining.length === 0) {
      results.push({ groups, pair });
      return;
    }

    if (remaining.length === 0) return;

    const sorted = [...remaining].sort((a, b) => a.toSortKey() - b.toSortKey());
    const first = sorted[0];

    // 雀頭を試す
    if (pair === null) {
      const pairIndex = sorted.findIndex((t, i) => i > 0 && t.equals(first));
      if (pairIndex !== -1) {
        const newRemaining = sorted.filter((_, i) => i !== 0 && i !== pairIndex);
        this.searchMeldSets(newRemaining, groups, [first, sorted[pairIndex]], results);
      }
    }

    // 刻子を試す
    const tripletIndices = this.findTriplet(sorted, first);
    if (tripletIndices.length === 3) {
      const triplet = tripletIndices.map(i => sorted[i]);
      const newRemaining = sorted.filter((_, i) => !tripletIndices.includes(i));
      this.searchMeldSets(newRemaining, [...groups, triplet], pair, results);
    }

    // 順子を試す（数牌のみ）
    if (!first.isHonor()) {
      const sequenceIndices = this.findSequence(sorted, first);
      if (sequenceIndices.length === 3) {
        const sequence = sequenceIndices.map(i => sorted[i]);
        const newRemaining = sorted.filter((_, i) => !sequenceIndices.includes(i));
        this.searchMeldSets(newRemaining, [...groups, sequence], pair, results);
      }
    }
  }

  /**
   * 刻子を探す
   */
  private findTriplet(tiles: Tile[], target: Tile): number[] {
    const indices: number[] = [];
    for (let i = 0; i < tiles.length; i++) {
      if (tiles[i].equals(target)) {
        indices.push(i);
        if (indices.length === 3) break;
      }
    }
    return indices.length === 3 ? indices : [];
  }

  /**
   * 順子を探す
   */
  private findSequence(tiles: Tile[], target: Tile): number[] {
    if (target.isHonor()) return [];

    const indices: number[] = [0]; // target自身
    const next1 = target.next();
    const next2 = next1?.next();

    if (!next1 || !next2) return [];

    const index1 = tiles.findIndex((t, i) => i > 0 && t.equals(next1));
    if (index1 === -1) return [];
    indices.push(index1);

    const index2 = tiles.findIndex((t, i) => i > index1 && t.equals(next2));
    if (index2 === -1) return [];
    indices.push(index2);

    return indices;
  }

  /**
   * 聴牌しているか
   */
  isTenpai(): boolean {
    return this._meldSets.length > 0 || this.isChiitoitsu(this._tiles);
  }

  /**
   * 和了しているか
   */
  isWinning(): boolean {
    return this.isTenpai();
  }

  /**
   * 待ち牌を取得
   */
  getWaitingTiles(): Tile[] {
    // 実装は複雑なので省略
    return [];
  }

  get tiles(): Tile[] {
    return [...this._tiles];
  }

  get melds(): Meld[] {
    return [...this._melds];
  }

  get winningTile(): Tile {
    return this._winningTile;
  }

  get winType(): WinType {
    return this._winType;
  }

  get meldSets(): MeldSet[] {
    return this._meldSets;
  }

  /**
   * 門前かどうか
   */
  isConcealed(): boolean {
    return this._melds.every(m => m.isClosed);
  }
}
