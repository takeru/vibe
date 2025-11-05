import { Command } from './Base.js';
import { GameRules } from '../../domain/valueObjects/GameRules.js';

/**
 * ゲーム作成コマンド
 */
export interface CreateGameCommand extends Command {
  type: 'CreateGame';
  playerIds: string[];
  rules: GameRules;
}

/**
 * ゲーム参加コマンド
 */
export interface JoinGameCommand extends Command {
  type: 'JoinGame';
  playerId: string;
  playerName: string;
  seat?: number;
}

/**
 * ゲーム開始コマンド
 */
export interface StartGameCommand extends Command {
  type: 'StartGame';
}

/**
 * 牌を引くコマンド
 */
export interface DrawTileCommand extends Command {
  type: 'DrawTile';
  playerId: string;
}

/**
 * 牌を捨てるコマンド
 */
export interface DiscardTileCommand extends Command {
  type: 'DiscardTile';
  playerId: string;
  tileId: string;
}

/**
 * チーコマンド
 */
export interface CallChiCommand extends Command {
  type: 'CallChi';
  playerId: string;
  tileIds: [string, string]; // 手牌から使う2枚
}

/**
 * ポンコマンド
 */
export interface CallPonCommand extends Command {
  type: 'CallPon';
  playerId: string;
  tileIds: [string, string]; // 手牌から使う2枚
}

/**
 * 明槓コマンド
 */
export interface CallMinkanCommand extends Command {
  type: 'CallMinkan';
  playerId: string;
  tileIds: [string, string, string]; // 手牌から使う3枚
}

/**
 * 暗槓コマンド
 */
export interface CallAnkanCommand extends Command {
  type: 'CallAnkan';
  playerId: string;
  tileIds: [string, string, string, string]; // 手牌から使う4枚
}

/**
 * 加槓コマンド
 */
export interface CallKakanCommand extends Command {
  type: 'CallKakan';
  playerId: string;
  meldIndex: number; // 既存のポンのインデックス
  tileId: string; // 追加する牌
}

/**
 * リーチ宣言コマンド
 */
export interface DeclareRiichiCommand extends Command {
  type: 'DeclareRiichi';
  playerId: string;
  discardTileId: string; // リーチ宣言牌
}

/**
 * ロン和了コマンド
 */
export interface DeclareRonCommand extends Command {
  type: 'DeclareRon';
  playerId: string;
}

/**
 * ツモ和了コマンド
 */
export interface DeclareTsumoCommand extends Command {
  type: 'DeclareTsumo';
  playerId: string;
}

/**
 * パス（副露しない）コマンド
 */
export interface PassCallCommand extends Command {
  type: 'PassCall';
  playerId: string;
}

/**
 * 九種九牌流局コマンド
 */
export interface DeclareNineTerminalsCommand extends Command {
  type: 'DeclareNineTerminals';
  playerId: string;
}

/**
 * ゲーム終了コマンド
 */
export interface EndGameCommand extends Command {
  type: 'EndGame';
}

/**
 * すべてのコマンドの型
 */
export type GameCommand =
  | CreateGameCommand
  | JoinGameCommand
  | StartGameCommand
  | DrawTileCommand
  | DiscardTileCommand
  | CallChiCommand
  | CallPonCommand
  | CallMinkanCommand
  | CallAnkanCommand
  | CallKakanCommand
  | DeclareRiichiCommand
  | DeclareRonCommand
  | DeclareTsumoCommand
  | PassCallCommand
  | DeclareNineTerminalsCommand
  | EndGameCommand;
