import { GameHost, GameHostType, HostStatus } from './GameHost.js';
import { Command, CommandResult, Query, QueryResult, GameEvent } from '../../application/contracts/Base.js';
import { GameCommand } from '../../application/contracts/Commands.js';
import { GameQuery } from '../../application/contracts/Queries.js';

/**
 * P2Pゲームホスト
 *
 * ピアツーピアでゲームを管理する実装
 * - WebRTC経由で通信
 * - 分散型（中央サーバー不要）
 * - ホストピアが権威を持つ
 */
export class P2PGameHost implements GameHost {
  readonly type = GameHostType.P2P;
  readonly id: string;

  private peerId: string;
  private signalServerUrl?: string;
  private peers: Map<string, any> = new Map(); // RTCPeerConnection (browser only)
  private eventHandlers: Map<string, Array<(event: GameEvent) => void>> = new Map();
  private connected: boolean = false;
  private isHost: boolean;

  constructor(peerId: string, signalServerUrl?: string, isHost: boolean = false) {
    this.peerId = peerId;
    this.signalServerUrl = signalServerUrl;
    this.isHost = isHost;
    this.id = peerId;
  }

  async connect(): Promise<void> {
    // WebRTCの初期化
    // シグナリングサーバーへの接続
    // ピアとの接続確立

    // 実装は複雑なため、骨格のみ
    this.connected = true;
    console.log(`P2P Host ${this.peerId} connected`);
  }

  async disconnect(): Promise<void> {
    // すべてのピア接続を閉じる
    for (const [peerId, connection] of this.peers) {
      connection.close();
    }
    this.peers.clear();
    this.connected = false;
    this.eventHandlers.clear();
  }

  async sendCommand(command: GameCommand): Promise<CommandResult> {
    if (!this.connected) {
      return {
        success: false,
        error: 'Not connected to P2P network',
      };
    }

    if (this.isHost) {
      // ホストの場合はローカルで処理
      return this.processCommandLocally(command);
    } else {
      // クライアントの場合はホストに送信
      return this.sendToHost('command', command);
    }
  }

  async sendQuery<T = any>(query: GameQuery): Promise<QueryResult<T>> {
    if (!this.connected) {
      return {
        success: false,
        error: 'Not connected to P2P network',
      };
    }

    if (this.isHost) {
      // ホストの場合はローカルで処理
      return this.processQueryLocally<T>(query);
    } else {
      // クライアントの場合はホストに送信
      return this.sendToHost('query', query);
    }
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
    return {
      connected: this.connected,
      latency: 30, // ダミー
      playersCount: this.peers.size + 1,
    };
  }

  /**
   * ピアを追加
   */
  async addPeer(peerId: string): Promise<void> {
    // WebRTC接続を確立
    // Note: RTCPeerConnection is browser-only API
    const peerConnection: any = null; // new RTCPeerConnection({ ... })

    // データチャネルをセットアップ
    // const dataChannel = peerConnection.createDataChannel('mahjong');
    // this.setupDataChannel(dataChannel, peerId);

    // this.peers.set(peerId, peerConnection);

    // SDP交換などの処理
    // 実装は省略（ブラウザ環境で実装）
  }

  /**
   * データチャネルをセットアップ
   */
  private setupDataChannel(dataChannel: any, peerId: string): void {
    dataChannel.onmessage = (event: any) => {
      const message = JSON.parse(event.data);
      this.handlePeerMessage(peerId, message);
    };

    dataChannel.onopen = () => {
      console.log(`Data channel with ${peerId} opened`);
    };

    dataChannel.onclose = () => {
      console.log(`Data channel with ${peerId} closed`);
      this.peers.delete(peerId);
    };
  }

  /**
   * ピアからのメッセージを処理
   */
  private handlePeerMessage(peerId: string, message: any): void {
    switch (message.type) {
      case 'command':
        if (this.isHost) {
          this.processCommandLocally(message.command).then(result => {
            this.sendToPeer(peerId, { type: 'commandResult', requestId: message.requestId, result });
          });
        }
        break;

      case 'query':
        if (this.isHost) {
          this.processQueryLocally(message.query).then(result => {
            this.sendToPeer(peerId, { type: 'queryResult', requestId: message.requestId, result });
          });
        }
        break;

      case 'event':
        this.handleEvent(message.event);
        break;
    }
  }

  /**
   * ホストに送信
   */
  private async sendToHost(type: string, payload: any): Promise<any> {
    // ホストピアを特定して送信
    // 実装は省略
    return { success: false, error: 'Not implemented' };
  }

  /**
   * ピアに送信
   */
  private sendToPeer(peerId: string, message: any): void {
    const peer = this.peers.get(peerId);
    if (peer) {
      // データチャネル経由で送信
      // 実装は省略
    }
  }

  /**
   * すべてのピアにブロードキャスト
   */
  private broadcastToPeers(message: any): void {
    for (const [peerId, _] of this.peers) {
      this.sendToPeer(peerId, message);
    }
  }

  /**
   * コマンドをローカルで処理
   */
  private async processCommandLocally(command: GameCommand): Promise<CommandResult> {
    // ローカルゲームホストと同様の処理
    // 実装は省略
    return { success: false, error: 'Not implemented' };
  }

  /**
   * クエリをローカルで処理
   */
  private async processQueryLocally<T>(query: GameQuery): Promise<QueryResult<T>> {
    // ローカルゲームホストと同様の処理
    // 実装は省略
    return { success: false, error: 'Not implemented' };
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

    // ホストの場合は他のピアにもブロードキャスト
    if (this.isHost) {
      this.broadcastToPeers({ type: 'event', event });
    }
  }
}
