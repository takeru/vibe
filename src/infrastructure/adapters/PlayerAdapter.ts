import { GameCommand } from '../../application/contracts/Commands.js';
import { GameQuery } from '../../application/contracts/Queries.js';
import { GameEvent } from '../../application/contracts/Base.js';
import { GameHost } from '../hosts/GameHost.js';

/**
 * プレイヤーアダプター抽象化
 *
 * CLI、Web、VR、AIなど、あらゆるプレイヤー実装の統一インターフェース
 */
export interface PlayerAdapter {
  /**
   * アダプターのタイプ
   */
  readonly type: PlayerAdapterType;

  /**
   * プレイヤーID
   */
  readonly playerId: string;

  /**
   * プレイヤー名
   */
  readonly playerName: string;

  /**
   * ゲームホストに接続
   */
  connect(host: GameHost, gameId: string): Promise<void>;

  /**
   * ゲームホストから切断
   */
  disconnect(): Promise<void>;

  /**
   * ゲームイベントを処理
   */
  handleEvent(event: GameEvent): void;

  /**
   * プレイヤーのターンを開始
   */
  startTurn(): Promise<void>;

  /**
   * プレイヤーのターンを終了
   */
  endTurn(): Promise<void>;

  /**
   * アダプターの状態
   */
  getState(): PlayerAdapterState;
}

/**
 * プレイヤーアダプターのタイプ
 */
export enum PlayerAdapterType {
  /** CLIプレイヤー（ターミナル） */
  CLI = 'cli',
  /** Webプレイヤー（ブラウザ） */
  WEB = 'web',
  /** VRプレイヤー（VRデバイス） */
  VR = 'vr',
  /** AIプレイヤー（CPU） */
  AI = 'ai',
  /** リモートプレイヤー（ネットワーク経由） */
  REMOTE = 'remote',
}

/**
 * プレイヤーアダプターの状態
 */
export interface PlayerAdapterState {
  connected: boolean;
  gameId?: string;
  isMyTurn: boolean;
  isWaiting: boolean;
}

/**
 * 人間プレイヤーアダプター（基底クラス）
 */
export abstract class HumanPlayerAdapter implements PlayerAdapter {
  abstract readonly type: PlayerAdapterType;
  readonly playerId: string;
  readonly playerName: string;

  protected host?: GameHost;
  protected gameId?: string;
  protected state: PlayerAdapterState = {
    connected: false,
    isMyTurn: false,
    isWaiting: false,
  };

  constructor(playerId: string, playerName: string) {
    this.playerId = playerId;
    this.playerName = playerName;
  }

  async connect(host: GameHost, gameId: string): Promise<void> {
    this.host = host;
    this.gameId = gameId;
    this.state.connected = true;
    this.state.gameId = gameId;

    // イベント購読
    host.subscribe('*', this.handleEvent.bind(this));
  }

  async disconnect(): Promise<void> {
    if (this.host) {
      this.host.unsubscribe('*', this.handleEvent.bind(this));
    }
    this.host = undefined;
    this.gameId = undefined;
    this.state.connected = false;
    this.state.gameId = undefined;
  }

  abstract handleEvent(event: GameEvent): void;

  abstract startTurn(): Promise<void>;

  async endTurn(): Promise<void> {
    this.state.isMyTurn = false;
  }

  getState(): PlayerAdapterState {
    return { ...this.state };
  }

  /**
   * コマンドを送信（ヘルパー）
   */
  protected async sendCommand(command: Omit<GameCommand, 'gameId' | 'playerId' | 'timestamp'>): Promise<any> {
    if (!this.host || !this.gameId) {
      throw new Error('Not connected to game');
    }

    const fullCommand = {
      ...command,
      gameId: this.gameId,
      playerId: this.playerId,
      timestamp: new Date(),
    } as GameCommand;

    return await this.host.sendCommand(fullCommand);
  }

  /**
   * クエリを送信（ヘルパー）
   */
  protected async sendQuery<T = any>(query: Omit<GameQuery, 'gameId' | 'playerId'>): Promise<T> {
    if (!this.host || !this.gameId) {
      throw new Error('Not connected to game');
    }

    const fullQuery = {
      ...query,
      gameId: this.gameId,
      playerId: this.playerId,
    } as GameQuery;

    const result = await this.host.sendQuery<T>(fullQuery);
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.data!;
  }
}

/**
 * AIプレイヤーアダプター（基底クラス）
 */
export abstract class AIPlayerAdapter implements PlayerAdapter {
  readonly type = PlayerAdapterType.AI;
  readonly playerId: string;
  readonly playerName: string;

  protected host?: GameHost;
  protected gameId?: string;
  protected state: PlayerAdapterState = {
    connected: false,
    isMyTurn: false,
    isWaiting: false,
  };

  constructor(playerId: string, playerName: string) {
    this.playerId = playerId;
    this.playerName = playerName;
  }

  async connect(host: GameHost, gameId: string): Promise<void> {
    this.host = host;
    this.gameId = gameId;
    this.state.connected = true;
    this.state.gameId = gameId;

    // イベント購読
    host.subscribe('*', this.handleEvent.bind(this));
  }

  async disconnect(): Promise<void> {
    if (this.host) {
      this.host.unsubscribe('*', this.handleEvent.bind(this));
    }
    this.host = undefined;
    this.gameId = undefined;
    this.state.connected = false;
  }

  handleEvent(event: GameEvent): void {
    // AIは基本的にイベントを無視（必要に応じてオーバーライド）
  }

  async startTurn(): Promise<void> {
    this.state.isMyTurn = true;
    // AIの思考と行動を実行
    await this.think();
  }

  async endTurn(): Promise<void> {
    this.state.isMyTurn = false;
  }

  getState(): PlayerAdapterState {
    return { ...this.state };
  }

  /**
   * AI思考ロジック（サブクラスで実装）
   */
  protected abstract think(): Promise<void>;

  /**
   * コマンドを送信（ヘルパー）
   */
  protected async sendCommand(command: Omit<GameCommand, 'gameId' | 'playerId' | 'timestamp'>): Promise<any> {
    if (!this.host || !this.gameId) {
      throw new Error('Not connected to game');
    }

    const fullCommand = {
      ...command,
      gameId: this.gameId,
      playerId: this.playerId,
      timestamp: new Date(),
    } as GameCommand;

    return await this.host.sendCommand(fullCommand);
  }

  /**
   * クエリを送信（ヘルパー）
   */
  protected async sendQuery<T = any>(query: Omit<GameQuery, 'gameId' | 'playerId'>): Promise<T> {
    if (!this.host || !this.gameId) {
      throw new Error('Not connected to game');
    }

    const fullQuery = {
      ...query,
      gameId: this.gameId,
      playerId: this.playerId,
    } as GameQuery;

    const result = await this.host.sendQuery<T>(fullQuery);
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.data!;
  }
}
