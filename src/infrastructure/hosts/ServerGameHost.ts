import { GameHost, GameHostType, HostStatus } from './GameHost.js';
import { Command, CommandResult, Query, QueryResult, GameEvent } from '../../application/contracts/Base.js';
import { GameCommand } from '../../application/contracts/Commands.js';
import { GameQuery } from '../../application/contracts/Queries.js';

/**
 * サーバーゲームホスト
 *
 * 中央サーバーでゲームを管理する実装
 * - HTTP/WebSocket経由で通信
 * - マルチプレイヤー対応
 * - サーバー側で権威を持つ
 */
export class ServerGameHost implements GameHost {
  readonly type = GameHostType.SERVER;
  readonly id: string;

  private serverUrl: string;
  private websocket?: any; // WebSocket (browser-only)
  private eventHandlers: Map<string, Array<(event: GameEvent) => void>> = new Map();
  private connected: boolean = false;
  private reconnectAttempts: number = 3;
  private timeout: number = 5000;

  constructor(serverUrl: string, id: string = 'server') {
    this.serverUrl = serverUrl;
    this.id = id;
  }

  async connect(): Promise<void> {
    // WebSocket接続
    // Note: WebSocket is browser-only API
    // In Node.js, use 'ws' package
    return new Promise((resolve, reject) => {
      try {
        // // WebSocketのURLに変換
        // const wsUrl = this.serverUrl.replace(/^http/, 'ws');
        // this.websocket = new WebSocket(`${wsUrl}/game`);

        // this.websocket.onopen = () => {
        //   this.connected = true;
        //   this.setupWebSocketHandlers();
        //   resolve();
        // };

        // this.websocket.onerror = (error) => {
        //   reject(new Error('WebSocket connection failed'));
        // };

        // タイムアウト
        // setTimeout(() => {
        //   if (!this.connected) {
        //     reject(new Error('Connection timeout'));
        //   }
        // }, this.timeout);

        // Temporary: resolve immediately for build
        this.connected = true;
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  async disconnect(): Promise<void> {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = undefined;
    }
    this.connected = false;
    this.eventHandlers.clear();
  }

  async sendCommand(command: GameCommand): Promise<CommandResult> {
    if (!this.connected || !this.websocket) {
      return {
        success: false,
        error: 'Not connected to server',
      };
    }

    return new Promise((resolve, reject) => {
      const requestId = this.generateRequestId();
      const message = {
        type: 'command',
        requestId,
        command,
      };

      // レスポンスハンドラーを設定
      const handler = (event: MessageEvent) => {
        const response = JSON.parse(event.data);
        if (response.requestId === requestId) {
          this.websocket!.removeEventListener('message', handler);
          resolve(response.result);
        }
      };

      this.websocket!.addEventListener('message', handler);

      // コマンドを送信
      this.websocket!.send(JSON.stringify(message));

      // タイムアウト
      setTimeout(() => {
        this.websocket!.removeEventListener('message', handler);
        reject(new Error('Command timeout'));
      }, this.timeout);
    });
  }

  async sendQuery<T = any>(query: GameQuery): Promise<QueryResult<T>> {
    if (!this.connected || !this.websocket) {
      return {
        success: false,
        error: 'Not connected to server',
      };
    }

    return new Promise((resolve, reject) => {
      const requestId = this.generateRequestId();
      const message = {
        type: 'query',
        requestId,
        query,
      };

      // レスポンスハンドラーを設定
      const handler = (event: MessageEvent) => {
        const response = JSON.parse(event.data);
        if (response.requestId === requestId) {
          this.websocket!.removeEventListener('message', handler);
          resolve(response.result);
        }
      };

      this.websocket!.addEventListener('message', handler);

      // クエリを送信
      this.websocket!.send(JSON.stringify(message));

      // タイムアウト
      setTimeout(() => {
        this.websocket!.removeEventListener('message', handler);
        reject(new Error('Query timeout'));
      }, this.timeout);
    });
  }

  subscribe(eventType: string, handler: (event: GameEvent) => void): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  unsubscribe(eventType: string, handler: (event: GameEvent) => void): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  getStatus(): HostStatus {
    // TODO: サーバーから取得
    return {
      connected: this.connected,
      latency: 50, // ダミー
      playersCount: 0,
      serverLoad: 0.5,
    };
  }

  /**
   * WebSocketハンドラーをセットアップ
   */
  private setupWebSocketHandlers(): void {
    if (!this.websocket) return;

    this.websocket.onmessage = (event: any) => {
      const message = JSON.parse(event.data);

      if (message.type === 'event') {
        this.handleEvent(message.event);
      }
    };

    this.websocket.onclose = () => {
      this.connected = false;
      // 再接続試行
      this.attemptReconnect();
    };

    this.websocket.onerror = (error: any) => {
      console.error('WebSocket error:', error);
    };
  }

  /**
   * イベントを処理
   */
  private handleEvent(event: GameEvent): void {
    const handlers = this.eventHandlers.get(event.type);
    if (handlers) {
      for (const handler of handlers) {
        handler(event);
      }
    }

    // 全イベント購読者にも通知
    const allHandlers = this.eventHandlers.get('*');
    if (allHandlers) {
      for (const handler of allHandlers) {
        handler(event);
      }
    }
  }

  /**
   * 再接続を試行
   */
  private async attemptReconnect(): Promise<void> {
    for (let i = 0; i < this.reconnectAttempts; i++) {
      try {
        await this.delay(Math.pow(2, i) * 1000);
        await this.connect();
        return;
      } catch {
        // 再試行
      }
    }
  }

  /**
   * リクエストIDを生成
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 待機
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
