/**
 * コマンド/クエリの基底型
 */

/**
 * コマンド（状態を変更する操作）
 */
export interface Command {
  readonly type: string;
  readonly gameId: string;
  readonly playerId?: string;
  readonly timestamp: Date;
}

/**
 * クエリ（状態を読み取る操作）
 */
export interface Query {
  readonly type: string;
  readonly gameId: string;
  readonly playerId?: string;
}

/**
 * コマンドの実行結果
 */
export interface CommandResult {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * クエリの実行結果
 */
export interface QueryResult<T = any> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * イベント（状態変更の通知）
 */
export interface GameEvent {
  readonly type: string;
  readonly gameId: string;
  readonly timestamp: Date;
  readonly data: any;
}
