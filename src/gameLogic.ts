import { Tile, TileType, Player, GameState, HONOR_NAMES } from './types.js';

// 牌を表示用に変換
export function tileToString(tile: Tile): string {
  if (tile.type === 'honor') {
    return HONOR_NAMES[tile.value];
  }
  const typeChar = tile.type === 'man' ? '萬' : tile.type === 'pin' ? '筒' : '索';
  return `${tile.value}${typeChar}`;
}

// 山を作成（136枚）
export function createWall(): Tile[] {
  const tiles: Tile[] = [];
  let id = 0;

  // 数牌（萬子、筒子、索子）各1-9を4枚ずつ
  const numberTypes: TileType[] = ['man', 'pin', 'sou'];
  for (const type of numberTypes) {
    for (let value = 1; value <= 9; value++) {
      for (let copy = 0; copy < 4; copy++) {
        tiles.push({ type, value, id: `${type}-${value}-${id++}` });
      }
    }
  }

  // 字牌（東南西北白發中）各4枚
  for (let value = 1; value <= 7; value++) {
    for (let copy = 0; copy < 4; copy++) {
      tiles.push({ type: 'honor', value, id: `honor-${value}-${id++}` });
    }
  }

  // シャッフル
  return tiles.sort(() => Math.random() - 0.5);
}

// 配牌（各プレイヤーに13枚配る）
export function dealInitialHands(wall: Tile[], playerCount: number): { hands: Tile[][], remainingWall: Tile[] } {
  const hands: Tile[][] = Array(playerCount).fill(null).map(() => []);
  let wallIndex = 0;

  // 各プレイヤーに13枚配る
  for (let i = 0; i < 13; i++) {
    for (let p = 0; p < playerCount; p++) {
      hands[p].push(wall[wallIndex++]);
    }
  }

  return {
    hands,
    remainingWall: wall.slice(wallIndex),
  };
}

// 手牌をソート
export function sortHand(hand: Tile[]): Tile[] {
  return [...hand].sort((a, b) => {
    const typeOrder = { man: 0, pin: 1, sou: 2, honor: 3 };
    if (typeOrder[a.type] !== typeOrder[b.type]) {
      return typeOrder[a.type] - typeOrder[b.type];
    }
    return a.value - b.value;
  });
}

// ゲーム初期化
export function initializeGame(): GameState {
  const wall = createWall();
  const { hands, remainingWall } = dealInitialHands(wall, 4);

  const players: Player[] = [
    { id: 0, name: 'あなた', hand: sortHand(hands[0]), discards: [], isDealer: true },
    { id: 1, name: 'COM 1', hand: sortHand(hands[1]), discards: [], isDealer: false },
    { id: 2, name: 'COM 2', hand: sortHand(hands[2]), discards: [], isDealer: false },
    { id: 3, name: 'COM 3', hand: sortHand(hands[3]), discards: [], isDealer: false },
  ];

  return {
    players,
    wall: remainingWall,
    currentPlayer: 0,
    phase: 'draw',
    turnCount: 0,
    lastDrawn: null,
  };
}

// 牌を引く
export function drawTile(state: GameState): GameState {
  if (state.wall.length === 0) {
    return { ...state, phase: 'gameover' };
  }

  const drawnTile = state.wall[0];
  const newWall = state.wall.slice(1);
  const newPlayers = [...state.players];
  newPlayers[state.currentPlayer].hand = sortHand([
    ...newPlayers[state.currentPlayer].hand,
    drawnTile,
  ]);

  return {
    ...state,
    players: newPlayers,
    wall: newWall,
    phase: 'discard',
    lastDrawn: drawnTile,
  };
}

// 牌を捨てる
export function discardTile(state: GameState, tileId: string): GameState {
  const newPlayers = [...state.players];
  const currentPlayer = newPlayers[state.currentPlayer];

  const tileIndex = currentPlayer.hand.findIndex(t => t.id === tileId);
  if (tileIndex === -1) return state;

  const discardedTile = currentPlayer.hand[tileIndex];
  currentPlayer.hand = currentPlayer.hand.filter(t => t.id !== tileId);
  currentPlayer.discards.push(discardedTile);

  const nextPlayer = (state.currentPlayer + 1) % state.players.length;

  return {
    ...state,
    players: newPlayers,
    currentPlayer: nextPlayer,
    phase: 'draw',
    turnCount: state.turnCount + 1,
    lastDrawn: null,
  };
}

// CPUの行動（簡易版）
export function cpuAction(state: GameState): GameState {
  if (state.currentPlayer === 0) return state; // プレイヤーはスキップ

  // 自動的に引く
  let newState = drawTile(state);

  // ランダムに捨てる
  const hand = newState.players[newState.currentPlayer].hand;
  if (hand.length > 0) {
    const randomTile = hand[Math.floor(Math.random() * hand.length)];
    newState = discardTile(newState, randomTile.id);
  }

  return newState;
}
