import { Tile } from '../valueObjects/Tile.js';
import { Meld } from '../valueObjects/Meld.js';
import { Player } from '../entities/Player.js';

/**
 * ドメインイベントの基底インターフェース
 */
export interface DomainEvent {
  readonly eventType: string;
  readonly timestamp: Date;
  readonly aggregateId: string;
}

/**
 * ゲーム開始イベント
 */
export interface GameStartedEvent extends DomainEvent {
  eventType: 'GameStarted';
  players: Player[];
}

/**
 * 局開始イベント
 */
export interface RoundStartedEvent extends DomainEvent {
  eventType: 'RoundStarted';
  roundName: string;
  dealerSeat: number;
}

/**
 * 牌をツモったイベント
 */
export interface TileDrawnEvent extends DomainEvent {
  eventType: 'TileDrawn';
  playerId: string;
  tile: Tile;
  isRinshan: boolean; // 嶺上牌かどうか
}

/**
 * 牌を捨てたイベント
 */
export interface TileDiscardedEvent extends DomainEvent {
  eventType: 'TileDiscarded';
  playerId: string;
  tile: Tile;
  isRiichi: boolean; // リーチ宣言を伴うか
  isTsumogiri: boolean; // ツモ切りか
}

/**
 * チーイベント
 */
export interface ChiCalledEvent extends DomainEvent {
  eventType: 'ChiCalled';
  playerId: string;
  meld: Meld;
  calledFrom: string; // 鳴いた相手のプレイヤーID
}

/**
 * ポンイベント
 */
export interface PonCalledEvent extends DomainEvent {
  eventType: 'PonCalled';
  playerId: string;
  meld: Meld;
  calledFrom: string;
}

/**
 * 明槓イベント
 */
export interface MinkanCalledEvent extends DomainEvent {
  eventType: 'MinkanCalled';
  playerId: string;
  meld: Meld;
  calledFrom: string;
}

/**
 * 暗槓イベント
 */
export interface AnkanCalledEvent extends DomainEvent {
  eventType: 'AnkanCalled';
  playerId: string;
  meld: Meld;
}

/**
 * 加槓イベント
 */
export interface KakanCalledEvent extends DomainEvent {
  eventType: 'KakanCalled';
  playerId: string;
  meld: Meld;
}

/**
 * リーチ宣言イベント
 */
export interface RiichiDeclaredEvent extends DomainEvent {
  eventType: 'RiichiDeclared';
  playerId: string;
  isDouble: boolean; // ダブルリーチか
}

/**
 * ロン和了イベント
 */
export interface RonWinEvent extends DomainEvent {
  eventType: 'RonWin';
  winnerId: string;
  loserId: string;
  winningTile: Tile;
  han: number;
  fu: number;
  points: number;
}

/**
 * ツモ和了イベント
 */
export interface TsumoWinEvent extends DomainEvent {
  eventType: 'TsumoWin';
  winnerId: string;
  winningTile: Tile;
  han: number;
  fu: number;
  points: { dealer: number; nonDealer: number };
}

/**
 * 流局イベント
 */
export interface DrawGameEvent extends DomainEvent {
  eventType: 'DrawGame';
  drawType: string;
  tenpaiPlayers: string[]; // 聴牌していたプレイヤー
}

/**
 * 点数支払いイベント
 */
export interface ScoreTransferEvent extends DomainEvent {
  eventType: 'ScoreTransfer';
  fromPlayerId: string;
  toPlayerId: string;
  amount: number;
  reason: string; // 'ron', 'tsumo', 'ryuukyoku'など
}

/**
 * ゲーム終了イベント
 */
export interface GameFinishedEvent extends DomainEvent {
  eventType: 'GameFinished';
  finalScores: Array<{
    playerId: string;
    score: number;
    rank: number;
  }>;
}

/**
 * ドメインイベントの型定義
 */
export type MahjongDomainEvent =
  | GameStartedEvent
  | RoundStartedEvent
  | TileDrawnEvent
  | TileDiscardedEvent
  | ChiCalledEvent
  | PonCalledEvent
  | MinkanCalledEvent
  | AnkanCalledEvent
  | KakanCalledEvent
  | RiichiDeclaredEvent
  | RonWinEvent
  | TsumoWinEvent
  | DrawGameEvent
  | ScoreTransferEvent
  | GameFinishedEvent;

/**
 * ドメインイベントパブリッシャー
 */
export class DomainEventPublisher {
  private static instance: DomainEventPublisher;
  private handlers: Map<string, Array<(event: DomainEvent) => void>> = new Map();

  private constructor() {}

  static getInstance(): DomainEventPublisher {
    if (!DomainEventPublisher.instance) {
      DomainEventPublisher.instance = new DomainEventPublisher();
    }
    return DomainEventPublisher.instance;
  }

  /**
   * イベントハンドラを登録
   */
  subscribe(eventType: string, handler: (event: DomainEvent) => void): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  /**
   * イベントを発行
   */
  publish(event: DomainEvent): void {
    const handlers = this.handlers.get(event.eventType);
    if (handlers) {
      for (const handler of handlers) {
        handler(event);
      }
    }
  }

  /**
   * 全てのハンドラをクリア
   */
  clear(): void {
    this.handlers.clear();
  }
}
