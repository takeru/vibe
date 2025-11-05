import { Player } from './Player.js';
import { Round, RoundType, RoundManager } from './Round.js';
import { Wall } from './Wall.js';
import { GameRules } from '../valueObjects/GameRules.js';

/**
 * ゲームの状態
 */
export enum GameStatus {
  /** 未開始 */
  NOT_STARTED = 'not_started',
  /** 進行中 */
  IN_PROGRESS = 'in_progress',
  /** 終了 */
  FINISHED = 'finished',
}

/**
 * ゲームフェーズ
 */
export enum GamePhase {
  /** 配牌 */
  DEAL = 'deal',
  /** ツモ */
  DRAW = 'draw',
  /** 捨て牌 */
  DISCARD = 'discard',
  /** 副露待ち */
  CALL_WAIT = 'call_wait',
  /** 和了 */
  WIN = 'win',
  /** 流局 */
  EXHAUSTIVE_DRAW = 'exhaustive_draw',
}

/**
 * ゲームエンティティ（集約ルート）
 */
export class Game {
  private readonly _id: string;
  private _players: Player[];
  private _currentRound: Round;
  private _wall: Wall;
  private _rules: GameRules;
  private _status: GameStatus;
  private _phase: GamePhase;
  private _currentPlayerIndex: number;

  constructor(id: string, players: Player[], rules: GameRules) {
    if (players.length !== 4) {
      throw new Error('Mahjong requires exactly 4 players');
    }

    this._id = id;
    this._players = players;
    this._rules = rules;
    this._status = GameStatus.NOT_STARTED;
    this._phase = GamePhase.DEAL;
    this._currentPlayerIndex = 0;

    // 最初の局を作成
    this._currentRound = new Round(RoundType.EAST, 1, 0);
    this._wall = new Wall(rules.useRedDora);
  }

  /**
   * ゲームを開始
   */
  start(): void {
    if (this._status !== GameStatus.NOT_STARTED) {
      throw new Error('Game has already started');
    }

    this._status = GameStatus.IN_PROGRESS;
    this._currentRound.start();
    this.dealInitialHands();
    this._phase = GamePhase.DRAW;
  }

  /**
   * 配牌
   */
  private dealInitialHands(): void {
    const hands = this._wall.dealInitialHands(4);
    for (let i = 0; i < 4; i++) {
      this._players[i].resetHand();
      for (const tile of hands[i]) {
        this._players[i].drawTile(tile);
      }
    }
  }

  /**
   * 次のプレイヤーに移動
   */
  nextPlayer(): void {
    this._currentPlayerIndex = (this._currentPlayerIndex + 1) % 4;
  }

  /**
   * 現在のプレイヤーを取得
   */
  getCurrentPlayer(): Player {
    return this._players[this._currentPlayerIndex];
  }

  /**
   * 親を取得
   */
  getDealer(): Player {
    return this._players[this._currentRound.dealerSeat];
  }

  /**
   * 次の局へ
   */
  nextRound(dealerWon: boolean, isDraw: boolean): void {
    try {
      this._currentRound = RoundManager.nextRound(
        this._currentRound,
        dealerWon,
        isDraw
      );
      this._wall = new Wall(this._rules.useRedDora);
      this.dealInitialHands();
      this._currentPlayerIndex = this._currentRound.dealerSeat;
      this._phase = GamePhase.DRAW;
    } catch (error) {
      // ゲーム終了
      this._status = GameStatus.FINISHED;
    }
  }

  /**
   * ゲームが終了しているか
   */
  isFinished(): boolean {
    return (
      this._status === GameStatus.FINISHED ||
      RoundManager.isGameFinished(this._currentRound, this._rules.gameType)
    );
  }

  /**
   * 最終順位を取得
   */
  getFinalRankings(): Array<{ player: Player; rank: number }> {
    const sorted = [...this._players].sort((a, b) => b.score - a.score);
    return sorted.map((player, index) => ({
      player,
      rank: index + 1,
    }));
  }

  get id(): string {
    return this._id;
  }

  get players(): Player[] {
    return [...this._players]; // 防御的コピー
  }

  get currentRound(): Round {
    return this._currentRound;
  }

  get wall(): Wall {
    return this._wall;
  }

  get rules(): GameRules {
    return this._rules;
  }

  get status(): GameStatus {
    return this._status;
  }

  get phase(): GamePhase {
    return this._phase;
  }

  set phase(value: GamePhase) {
    this._phase = value;
  }

  get currentPlayerIndex(): number {
    return this._currentPlayerIndex;
  }

  /**
   * シリアライズ
   */
  toJSON(): object {
    return {
      id: this._id,
      players: this._players.map(p => p.toJSON()),
      currentRound: this._currentRound.toJSON(),
      wall: this._wall.toJSON(),
      rules: this._rules.toJSON(),
      status: this._status,
      phase: this._phase,
      currentPlayerIndex: this._currentPlayerIndex,
    };
  }

  /**
   * デシリアライズ
   */
  static fromJSON(json: any): Game {
    const players = json.players.map((p: any) => Player.fromJSON(p));
    const rules = GameRules.fromJSON(json.rules);
    const game = new Game(json.id, players, rules);
    game._currentRound = Round.fromJSON(json.currentRound);
    game._wall = Wall.fromJSON(json.wall);
    game._status = json.status;
    game._phase = json.phase;
    game._currentPlayerIndex = json.currentPlayerIndex;
    return game;
  }
}
