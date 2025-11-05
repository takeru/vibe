import { GameHost, GameHostType, HostStatus } from './GameHost.js';
import { Command, CommandResult, Query, QueryResult, GameEvent } from '../../application/contracts/Base.js';
import { GameCommand } from '../../application/contracts/Commands.js';
import { GameQuery } from '../../application/contracts/Queries.js';
import { Game } from '../../domain/entities/Game.js';

/**
 * ローカルゲームホスト
 *
 * 同一プロセス内でゲームを管理する実装
 * - UIとゲームロジックが同じプロセス
 * - ネットワーク不要
 * - シングルプレイヤー or ローカルマルチプレイヤー向け
 */
export class LocalGameHost implements GameHost {
  readonly type = GameHostType.LOCAL;
  readonly id: string;

  private games: Map<string, Game> = new Map();
  private eventHandlers: Map<string, Array<(event: GameEvent) => void>> = new Map();
  private connected: boolean = false;

  constructor(id: string = 'local') {
    this.id = id;
  }

  async connect(): Promise<void> {
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.games.clear();
    this.eventHandlers.clear();
  }

  async sendCommand(command: GameCommand): Promise<CommandResult> {
    if (!this.connected) {
      return {
        success: false,
        error: 'Not connected to host',
      };
    }

    try {
      // コマンドタイプに応じて処理を分岐
      switch (command.type) {
        case 'CreateGame':
          return await this.handleCreateGame(command);
        case 'StartGame':
          return await this.handleStartGame(command);
        case 'DrawTile':
          return await this.handleDrawTile(command);
        case 'DiscardTile':
          return await this.handleDiscardTile(command);
        // 他のコマンドも同様に実装
        default:
          return {
            success: false,
            error: `Unknown command type: ${command.type}`,
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async sendQuery<T = any>(query: GameQuery): Promise<QueryResult<T>> {
    if (!this.connected) {
      return {
        success: false,
        error: 'Not connected to host',
      };
    }

    try {
      switch (query.type) {
        case 'GetGameState':
          return await this.handleGetGameState(query);
        case 'GetPlayerInfo':
          return await this.handleGetPlayerInfo(query);
        case 'GetHand':
          return await this.handleGetHand(query);
        // 他のクエリも同様に実装
        default:
          return {
            success: false,
            error: `Unknown query type: ${query.type}`,
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
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
      latency: 0, // ローカルなので0ms
      playersCount: Array.from(this.games.values()).reduce(
        (sum, game) => sum + game.players.length,
        0
      ),
    };
  }

  /**
   * イベントを発行（内部用）
   */
  private publishEvent(event: GameEvent): void {
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

  // --- コマンドハンドラー ---

  private async handleCreateGame(command: any): Promise<CommandResult> {
    // CreateGameCommandの実装
    // TODO: 実装
    return { success: true };
  }

  private async handleStartGame(command: any): Promise<CommandResult> {
    const game = this.games.get(command.gameId);
    if (!game) {
      return { success: false, error: 'Game not found' };
    }

    game.start();

    this.publishEvent({
      type: 'GameStarted',
      gameId: command.gameId,
      timestamp: new Date(),
      data: { gameId: command.gameId },
    });

    return { success: true };
  }

  private async handleDrawTile(command: any): Promise<CommandResult> {
    const game = this.games.get(command.gameId);
    if (!game) {
      return { success: false, error: 'Game not found' };
    }

    const player = game.players.find(p => p.id === command.playerId);
    if (!player) {
      return { success: false, error: 'Player not found' };
    }

    const tile = game.wall.drawTile();
    if (!tile) {
      return { success: false, error: 'No more tiles' };
    }

    player.drawTile(tile);

    this.publishEvent({
      type: 'TileDrawn',
      gameId: command.gameId,
      timestamp: new Date(),
      data: {
        playerId: command.playerId,
        tile: tile.toJSON(),
      },
    });

    return { success: true, data: { tile: tile.toJSON() } };
  }

  private async handleDiscardTile(command: any): Promise<CommandResult> {
    const game = this.games.get(command.gameId);
    if (!game) {
      return { success: false, error: 'Game not found' };
    }

    const player = game.players.find(p => p.id === command.playerId);
    if (!player) {
      return { success: false, error: 'Player not found' };
    }

    const tile = player.discardTile(command.tileId);
    if (!tile) {
      return { success: false, error: 'Tile not found' };
    }

    this.publishEvent({
      type: 'TileDiscarded',
      gameId: command.gameId,
      timestamp: new Date(),
      data: {
        playerId: command.playerId,
        tile: tile.toJSON(),
      },
    });

    return { success: true, data: { tile: tile.toJSON() } };
  }

  // --- クエリハンドラー ---

  private async handleGetGameState(query: any): Promise<QueryResult> {
    const game = this.games.get(query.gameId);
    if (!game) {
      return { success: false, error: 'Game not found' };
    }

    return {
      success: true,
      data: {
        gameId: game.id,
        status: game.status,
        phase: game.phase,
        currentPlayerIndex: game.currentPlayerIndex,
        round: game.currentRound.toJSON(),
        wall: {
          remainingCount: game.wall.getRemainingCount(),
        },
        rules: game.rules.toJSON(),
      },
    };
  }

  private async handleGetPlayerInfo(query: any): Promise<QueryResult> {
    const game = this.games.get(query.gameId);
    if (!game) {
      return { success: false, error: 'Game not found' };
    }

    const player = game.players.find(p => p.id === query.playerId);
    if (!player) {
      return { success: false, error: 'Player not found' };
    }

    return {
      success: true,
      data: {
        id: player.id,
        name: player.name,
        seat: player.seat,
        score: player.score,
        status: player.status,
        isRiichi: player.isRiichi(),
        discardCount: player.discards.length,
      },
    };
  }

  private async handleGetHand(query: any): Promise<QueryResult> {
    const game = this.games.get(query.gameId);
    if (!game) {
      return { success: false, error: 'Game not found' };
    }

    const player = game.players.find(p => p.id === query.playerId);
    if (!player) {
      return { success: false, error: 'Player not found' };
    }

    return {
      success: true,
      data: {
        concealedTiles: player.hand.concealedTiles.map(t => t.toJSON()),
        melds: player.hand.melds.map(m => m.toJSON()),
        drawnTile: player.hand.drawnTile?.toJSON() ?? null,
        isConcealed: player.hand.isConcealed(),
      },
    };
  }
}
