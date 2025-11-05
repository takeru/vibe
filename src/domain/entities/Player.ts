import { Hand } from './Hand.js';
import { Tile } from '../valueObjects/Tile.js';

/**
 * プレイヤーの状態
 */
export enum PlayerStatus {
  /** 通常 */
  NORMAL = 'normal',
  /** リーチ中 */
  RIICHI = 'riichi',
  /** ダブルリーチ中 */
  DOUBLE_RIICHI = 'double_riichi',
  /** 聴牌 */
  TENPAI = 'tenpai',
  /** 和了 */
  WON = 'won',
}

/**
 * プレイヤーエンティティ
 */
export class Player {
  private readonly _id: string;
  private _name: string;
  private _seat: number; // 0-3
  private _score: number; // 持ち点
  private _hand: Hand;
  private _discards: Tile[];
  private _status: PlayerStatus;
  private _riichiTurn: number | null; // リーチした巡目
  private _furiten: boolean; // フリテン状態

  constructor(id: string, name: string, seat: number, initialScore: number = 25000) {
    if (seat < 0 || seat > 3) {
      throw new Error('Seat must be between 0 and 3');
    }

    this._id = id;
    this._name = name;
    this._seat = seat;
    this._score = initialScore;
    this._hand = new Hand();
    this._discards = [];
    this._status = PlayerStatus.NORMAL;
    this._riichiTurn = null;
    this._furiten = false;
  }

  /**
   * 牌を引く
   */
  drawTile(tile: Tile): void {
    this._hand.addTile(tile);
  }

  /**
   * 牌を捨てる
   */
  discardTile(tileId: string): Tile | null {
    const tile = this._hand.removeTile(tileId);
    if (tile) {
      this._discards.push(tile);
      this.checkFuriten();
    }
    return tile;
  }

  /**
   * リーチを宣言
   */
  declareRiichi(turnCount: number): void {
    if (!this._hand.isConcealed()) {
      throw new Error('Cannot riichi with open hand');
    }
    if (this._score < 1000) {
      throw new Error('Not enough points to riichi');
    }

    this._status = turnCount === 1 ? PlayerStatus.DOUBLE_RIICHI : PlayerStatus.RIICHI;
    this._riichiTurn = turnCount;
    this._score -= 1000; // リーチ棒
  }

  /**
   * フリテン判定
   */
  private checkFuriten(): void {
    // TODO: 待ち牌が自分の捨て牌にあるかチェック
    this._furiten = false;
  }

  /**
   * 点数を加算
   */
  addScore(points: number): void {
    this._score += points;
  }

  /**
   * 点数を減算
   */
  subtractScore(points: number): void {
    this._score = Math.max(0, this._score - points);
  }

  /**
   * 手牌をリセット
   */
  resetHand(): void {
    this._hand = new Hand();
    this._discards = [];
    this._status = PlayerStatus.NORMAL;
    this._riichiTurn = null;
    this._furiten = false;
  }

  /**
   * リーチ中かどうか
   */
  isRiichi(): boolean {
    return (
      this._status === PlayerStatus.RIICHI ||
      this._status === PlayerStatus.DOUBLE_RIICHI
    );
  }

  /**
   * 門前かどうか
   */
  isConcealed(): boolean {
    return this._hand.isConcealed();
  }

  /**
   * 最後の捨て牌を取得
   */
  getLastDiscard(): Tile | null {
    return this._discards.length > 0
      ? this._discards[this._discards.length - 1]
      : null;
  }

  /**
   * 上家かどうか（targetから見て）
   */
  isKamicha(targetSeat: number): boolean {
    return this._seat === (targetSeat + 3) % 4;
  }

  /**
   * 対面かどうか（targetから見て）
   */
  isToimen(targetSeat: number): boolean {
    return this._seat === (targetSeat + 2) % 4;
  }

  /**
   * 下家かどうか（targetから見て）
   */
  isShimocha(targetSeat: number): boolean {
    return this._seat === (targetSeat + 1) % 4;
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get seat(): number {
    return this._seat;
  }

  get score(): number {
    return this._score;
  }

  get hand(): Hand {
    return this._hand;
  }

  get discards(): Tile[] {
    return [...this._discards]; // 防御的コピー
  }

  get status(): PlayerStatus {
    return this._status;
  }

  set status(value: PlayerStatus) {
    this._status = value;
  }

  get riichiTurn(): number | null {
    return this._riichiTurn;
  }

  get furiten(): boolean {
    return this._furiten;
  }

  set furiten(value: boolean) {
    this._furiten = value;
  }

  /**
   * シリアライズ
   */
  toJSON(): object {
    return {
      id: this._id,
      name: this._name,
      seat: this._seat,
      score: this._score,
      hand: this._hand.toJSON(),
      discards: this._discards.map(t => t.toJSON()),
      status: this._status,
      riichiTurn: this._riichiTurn,
      furiten: this._furiten,
    };
  }

  /**
   * デシリアライズ
   */
  static fromJSON(json: any): Player {
    const player = new Player(json.id, json.name, json.seat, json.score);
    player._hand = Hand.fromJSON(json.hand);
    player._discards = json.discards.map((t: any) => Tile.fromJSON(t));
    player._status = json.status;
    player._riichiTurn = json.riichiTurn;
    player._furiten = json.furiten;
    return player;
  }
}
