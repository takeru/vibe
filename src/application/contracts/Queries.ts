import { Query } from './Base.js';
import { Tile } from '../../domain/valueObjects/Tile.js';
import { Meld } from '../../domain/valueObjects/Meld.js';
import { GameRules } from '../../domain/valueObjects/GameRules.js';

/**
 * ゲーム状態取得クエリ
 */
export interface GetGameStateQuery extends Query {
  type: 'GetGameState';
}

/**
 * ゲーム状態のレスポンス
 */
export interface GameStateResponse {
  gameId: string;
  status: string;
  phase: string;
  currentPlayerIndex: number;
  round: {
    type: string;
    number: number;
    dealerSeat: number;
    honbaCount: number;
    riichiSticks: number;
  };
  wall: {
    remainingCount: number;
  };
  rules: GameRules;
}

/**
 * プレイヤー情報取得クエリ
 */
export interface GetPlayerInfoQuery extends Query {
  type: 'GetPlayerInfo';
  playerId: string;
}

/**
 * プレイヤー情報のレスポンス
 */
export interface PlayerInfoResponse {
  id: string;
  name: string;
  seat: number;
  score: number;
  status: string;
  isRiichi: boolean;
  discardCount: number;
}

/**
 * 手牌取得クエリ（自分の手牌のみ）
 */
export interface GetHandQuery extends Query {
  type: 'GetHand';
  playerId: string;
}

/**
 * 手牌のレスポンス
 */
export interface HandResponse {
  concealedTiles: Tile[];
  melds: Meld[];
  drawnTile: Tile | null;
  isConcealed: boolean;
}

/**
 * 捨て牌取得クエリ
 */
export interface GetDiscardsQuery extends Query {
  type: 'GetDiscards';
  playerId?: string; // 未指定の場合は全プレイヤー
}

/**
 * 捨て牌のレスポンス
 */
export interface DiscardsResponse {
  discards: Array<{
    playerId: string;
    tiles: Tile[];
  }>;
}

/**
 * 可能なアクション取得クエリ
 */
export interface GetPossibleActionsQuery extends Query {
  type: 'GetPossibleActions';
  playerId: string;
}

/**
 * 可能なアクション
 */
export interface PossibleAction {
  type: string;
  description: string;
  parameters?: any;
}

/**
 * 可能なアクションのレスポンス
 */
export interface PossibleActionsResponse {
  actions: PossibleAction[];
}

/**
 * ドラ表示牌取得クエリ
 */
export interface GetDoraIndicatorsQuery extends Query {
  type: 'GetDoraIndicators';
}

/**
 * ドラ表示牌のレスポンス
 */
export interface DoraIndicatorsResponse {
  doraIndicators: Tile[];
  uraDoraIndicators?: Tile[]; // リーチ時のみ
}

/**
 * 全プレイヤー情報取得クエリ
 */
export interface GetAllPlayersQuery extends Query {
  type: 'GetAllPlayers';
}

/**
 * 全プレイヤー情報のレスポンス
 */
export interface AllPlayersResponse {
  players: PlayerInfoResponse[];
}

/**
 * ゲーム履歴取得クエリ
 */
export interface GetGameHistoryQuery extends Query {
  type: 'GetGameHistory';
  fromTurn?: number;
  toTurn?: number;
}

/**
 * ゲーム履歴のレスポンス
 */
export interface GameHistoryResponse {
  events: Array<{
    turn: number;
    timestamp: Date;
    type: string;
    playerId?: string;
    description: string;
    data: any;
  }>;
}

/**
 * 待ち牌取得クエリ（聴牌時）
 */
export interface GetWaitingTilesQuery extends Query {
  type: 'GetWaitingTiles';
  playerId: string;
}

/**
 * 待ち牌のレスポンス
 */
export interface WaitingTilesResponse {
  isTenpai: boolean;
  waitingTiles: Tile[];
  waitType?: string;
}

/**
 * すべてのクエリの型
 */
export type GameQuery =
  | GetGameStateQuery
  | GetPlayerInfoQuery
  | GetHandQuery
  | GetDiscardsQuery
  | GetPossibleActionsQuery
  | GetDoraIndicatorsQuery
  | GetAllPlayersQuery
  | GetGameHistoryQuery
  | GetWaitingTilesQuery;
