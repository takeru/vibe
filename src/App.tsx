import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { GameState } from './types.js';
import {
  initializeGame,
  drawTile,
  discardTile,
  cpuAction,
  tileToString,
} from './gameLogic.js';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(initializeGame());
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [message, setMessage] = useState('矢印キーで牌を選択、Enterで捨てる、Qで終了');

  // CPU自動プレイ
  useEffect(() => {
    if (gameState.currentPlayer !== 0 && gameState.phase !== 'gameover') {
      const timer = setTimeout(() => {
        setGameState(cpuAction(gameState));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  useInput((input, key) => {
    if (input === 'q') {
      process.exit(0);
    }

    const player = gameState.players[0];
    const handSize = player.hand.length;

    if (gameState.currentPlayer === 0) {
      if (gameState.phase === 'draw') {
        // スペースキーで引く
        if (input === ' ') {
          setGameState(drawTile(gameState));
          setMessage('牌を捨ててください');
        }
      } else if (gameState.phase === 'discard') {
        if (key.leftArrow) {
          setSelectedIndex(Math.max(0, selectedIndex - 1));
        } else if (key.rightArrow) {
          setSelectedIndex(Math.min(handSize - 1, selectedIndex + 1));
        } else if (key.return) {
          const selectedTile = player.hand[selectedIndex];
          if (selectedTile) {
            setGameState(discardTile(gameState, selectedTile.id));
            setSelectedIndex(Math.min(selectedIndex, player.hand.length - 2));
            setMessage('次のターン...');
          }
        }
      }
    }
  });

  const player = gameState.players[0];
  const otherPlayers = gameState.players.slice(1);

  if (gameState.phase === 'gameover') {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="red" bold>ゲーム終了！</Text>
        <Text>山が尽きました。</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Text color="cyan" bold>═══ 麻雀 CLI ═══</Text>
      <Text> </Text>

      {/* 他プレイヤー */}
      {otherPlayers.map((p, idx) => (
        <Box key={p.id} flexDirection="column" marginBottom={1}>
          <Text color={gameState.currentPlayer === p.id ? 'green' : 'white'}>
            {p.name} {gameState.currentPlayer === p.id ? '★' : ''} ({p.hand.length}枚)
          </Text>
          <Text dimColor>
            捨牌: {p.discards.map(t => tileToString(t)).join(' ')}
          </Text>
        </Box>
      ))}

      <Text> </Text>
      <Text>─────────────────────</Text>
      <Text> </Text>

      {/* プレイヤーの手牌 */}
      <Box flexDirection="column">
        <Text color={gameState.currentPlayer === 0 ? 'green' : 'white'} bold>
          {player.name} {gameState.currentPlayer === 0 ? '★' : ''}
        </Text>
        <Box>
          {player.hand.map((tile, idx) => (
            <Box key={tile.id} marginRight={1}>
              <Text
                color={idx === selectedIndex && gameState.phase === 'discard' ? 'yellow' : 'white'}
                bold={idx === selectedIndex && gameState.phase === 'discard'}
                inverse={idx === selectedIndex && gameState.phase === 'discard'}
              >
                {tileToString(tile)}
              </Text>
            </Box>
          ))}
        </Box>
        <Text dimColor>
          捨牌: {player.discards.map(t => tileToString(t)).join(' ')}
        </Text>
      </Box>

      <Text> </Text>
      <Text>─────────────────────</Text>
      <Text> </Text>

      {/* ステータス */}
      <Text>ターン: {gameState.turnCount + 1} | 山: {gameState.wall.length}枚</Text>
      <Text color="magenta">{message}</Text>
      {gameState.currentPlayer === 0 && gameState.phase === 'draw' && (
        <Text color="cyan">スペースキーで牌を引く</Text>
      )}
      <Text dimColor>Q: 終了</Text>
    </Box>
  );
}
