import { Tile, TileFactory } from '../valueObjects/Tile.js';

/**
 * 山（牌山）エンティティ
 */
export class Wall {
  private _tiles: Tile[];
  private _deadWall: Tile[]; // 王牌（14枚）
  private _doraIndicators: Tile[]; // ドラ表示牌
  private _uraDoraIndicators: Tile[]; // 裏ドラ表示牌
  private _drawIndex: number; // 次に引く牌のインデックス
  private _rinshanIndex: number; // 嶺上牌のインデックス

  constructor(useRedDora: boolean = false) {
    // 136枚の牌を作成してシャッフル
    const allTiles = TileFactory.createStandardSet(useRedDora);
    this.shuffle(allTiles);

    // 王牌（最後の14枚）を分離
    this._deadWall = allTiles.slice(-14);
    this._tiles = allTiles.slice(0, -14);

    // ドラ表示牌の設定（王牌の最初から5枚おきに配置）
    this._doraIndicators = [
      this._deadWall[4],  // 3枚目の上
      this._deadWall[5],  // カン1回目
      this._deadWall[6],  // カン2回目
      this._deadWall[7],  // カン3回目
      this._deadWall[8],  // カン4回目
    ];

    // 裏ドラ表示牌（ドラの下）
    this._uraDoraIndicators = [
      this._deadWall[9],
      this._deadWall[10],
      this._deadWall[11],
      this._deadWall[12],
      this._deadWall[13],
    ];

    this._drawIndex = 0;
    this._rinshanIndex = 0; // 嶺上牌は王牌の最初から
  }

  /**
   * 牌をシャッフル
   */
  private shuffle(tiles: Tile[]): void {
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
  }

  /**
   * 通常のツモ
   */
  drawTile(): Tile | null {
    if (this._drawIndex >= this._tiles.length) {
      return null; // 山が尽きた
    }
    return this._tiles[this._drawIndex++];
  }

  /**
   * 嶺上牌をツモ（カン後）
   */
  drawRinshanTile(): Tile | null {
    if (this._rinshanIndex >= 4) {
      return null; // 嶺上牌がない
    }
    return this._deadWall[this._rinshanIndex++];
  }

  /**
   * 残り牌数を取得
   */
  getRemainingCount(): number {
    return this._tiles.length - this._drawIndex;
  }

  /**
   * 山が尽きたかどうか
   */
  isEmpty(): boolean {
    return this._drawIndex >= this._tiles.length;
  }

  /**
   * 現在有効なドラ表示牌を取得
   */
  getActiveDoraIndicators(kanCount: number = 0): Tile[] {
    // 通常は1枚、カンするたびに1枚ずつ増える
    return this._doraIndicators.slice(0, 1 + kanCount);
  }

  /**
   * 裏ドラ表示牌を取得（リーチ時のみ）
   */
  getUraDoraIndicators(kanCount: number = 0): Tile[] {
    return this._uraDoraIndicators.slice(0, 1 + kanCount);
  }

  /**
   * ドラ表示牌から実際のドラ牌を取得
   */
  static getDoraFromIndicator(indicator: Tile): Tile {
    if (indicator.isHonor()) {
      // 字牌の場合
      if (indicator.isWind()) {
        // 風牌: 東→南→西→北→東
        const nextValue = indicator.value === 4 ? 1 : indicator.value + 1;
        return TileFactory.create(indicator.suit, nextValue);
      } else {
        // 三元牌: 白→發→中→白
        const nextValue = indicator.value === 7 ? 5 : indicator.value + 1;
        return TileFactory.create(indicator.suit, nextValue);
      }
    } else {
      // 数牌の場合: 1→2→...→9→1
      const nextValue = indicator.value === 9 ? 1 : indicator.value + 1;
      return TileFactory.create(indicator.suit, nextValue);
    }
  }

  /**
   * ドラの枚数をカウント
   */
  static countDora(tiles: Tile[], doraIndicators: Tile[]): number {
    let count = 0;
    for (const indicator of doraIndicators) {
      const doraTile = Wall.getDoraFromIndicator(indicator);
      for (const tile of tiles) {
        if (tile.equals(doraTile) || tile.isRed) {
          count++;
        }
      }
    }
    return count;
  }

  /**
   * 配牌（各プレイヤーに13枚配る）
   */
  dealInitialHands(playerCount: number): Tile[][] {
    if (playerCount < 1 || playerCount > 4) {
      throw new Error('Player count must be between 1 and 4');
    }

    const hands: Tile[][] = Array(playerCount)
      .fill(null)
      .map(() => []);

    // 各プレイヤーに13枚ずつ配る
    for (let round = 0; round < 13; round++) {
      for (let player = 0; player < playerCount; player++) {
        const tile = this.drawTile();
        if (!tile) {
          throw new Error('Not enough tiles to deal');
        }
        hands[player].push(tile);
      }
    }

    return hands;
  }

  get tiles(): Tile[] {
    return [...this._tiles]; // 防御的コピー
  }

  get deadWall(): Tile[] {
    return [...this._deadWall]; // 防御的コピー
  }

  /**
   * シリアライズ
   */
  toJSON(): object {
    return {
      tiles: this._tiles.map(t => t.toJSON()),
      deadWall: this._deadWall.map(t => t.toJSON()),
      doraIndicators: this._doraIndicators.map(t => t.toJSON()),
      uraDoraIndicators: this._uraDoraIndicators.map(t => t.toJSON()),
      drawIndex: this._drawIndex,
      rinshanIndex: this._rinshanIndex,
    };
  }

  /**
   * デシリアライズ
   */
  static fromJSON(json: any): Wall {
    const wall = new Wall();
    wall._tiles = json.tiles.map((t: any) => Tile.fromJSON(t));
    wall._deadWall = json.deadWall.map((t: any) => Tile.fromJSON(t));
    wall._doraIndicators = json.doraIndicators.map((t: any) => Tile.fromJSON(t));
    wall._uraDoraIndicators = json.uraDoraIndicators.map((t: any) => Tile.fromJSON(t));
    wall._drawIndex = json.drawIndex;
    wall._rinshanIndex = json.rinshanIndex;
    return wall;
  }
}
