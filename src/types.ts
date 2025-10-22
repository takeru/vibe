// 麻雀牌の種類
export type TileType = 'man' | 'pin' | 'sou' | 'honor';

// 牌の定義
export interface Tile {
  type: TileType;
  value: number; // 1-9 for number tiles, 1-7 for honor tiles
  id: string; // ユニークID
}

// 風牌: 1=東, 2=南, 3=西, 4=北
// 三元牌: 5=白, 6=發, 7=中
export const HONOR_NAMES: Record<number, string> = {
  1: '東',
  2: '南',
  3: '西',
  4: '北',
  5: '白',
  6: '發',
  7: '中',
};

export interface Player {
  id: number;
  name: string;
  hand: Tile[];
  discards: Tile[];
  isDealer: boolean;
}

export interface GameState {
  players: Player[];
  wall: Tile[];
  currentPlayer: number;
  phase: 'draw' | 'discard' | 'gameover';
  turnCount: number;
  lastDrawn: Tile | null;
}
