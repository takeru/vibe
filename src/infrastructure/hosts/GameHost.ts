import { Command, CommandResult, Query, QueryResult, GameEvent } from '../../application/contracts/Base.js';
import { GameCommand } from '../../application/contracts/Commands.js';
import { GameQuery } from '../../application/contracts/Queries.js';

/**
 * ゲームホスト抽象化
 *
 * サーバー、ローカル、P2Pなど、ゲーム管理の方式に依存しない統一インターフェース
 */
export interface GameHost {
  /**
   * ホストのタイプ
   */
  readonly type: GameHostType;

  /**
   * ホストの識別子
   */
  readonly id: string;

  /**
   * ホストに接続
   */
  connect(): Promise<void>;

  /**
   * ホストから切断
   */
  disconnect(): Promise<void>;

  /**
   * コマンドを送信
   */
  sendCommand(command: GameCommand): Promise<CommandResult>;

  /**
   * クエリを送信
   */
  sendQuery<T = any>(query: GameQuery): Promise<QueryResult<T>>;

  /**
   * イベントを購読
   */
  subscribe(eventType: string, handler: (event: GameEvent) => void): void;

  /**
   * イベント購読を解除
   */
  unsubscribe(eventType: string, handler: (event: GameEvent) => void): void;

  /**
   * 接続状態
   */
  isConnected(): boolean;

  /**
   * ホストの状態
   */
  getStatus(): HostStatus;
}

/**
 * ゲームホストのタイプ
 */
export enum GameHostType {
  /** ローカル（同一プロセス内） */
  LOCAL = 'local',
  /** サーバー（中央サーバー） */
  SERVER = 'server',
  /** P2P（分散ピアツーピア） */
  P2P = 'p2p',
}

/**
 * ホストの状態
 */
export interface HostStatus {
  connected: boolean;
  latency?: number; // ms
  playersCount?: number;
  serverLoad?: number; // 0-1
}

/**
 * ゲームホストファクトリー
 */
export interface GameHostFactory {
  /**
   * ローカルホストを作成
   */
  createLocalHost(): GameHost;

  /**
   * サーバーホストを作成
   */
  createServerHost(serverUrl: string): GameHost;

  /**
   * P2Pホストを作成
   */
  createP2PHost(peerId: string, signalServerUrl?: string): GameHost;
}

/**
 * ゲームホストの設定
 */
export interface GameHostConfig {
  type: GameHostType;
  url?: string; // サーバーURL（ServerまたはP2Pの場合）
  peerId?: string; // ピアID（P2Pの場合）
  signalServerUrl?: string; // シグナリングサーバーURL（P2Pの場合）
  reconnectAttempts?: number;
  reconnectDelay?: number;
  timeout?: number;
}
