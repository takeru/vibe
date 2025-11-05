# 統一API設計 - Universal Mahjong Interface

## 概要

このドキュメントでは、CLI、Web、VR、AIなど、あらゆるクライアント実装が共通のAPIで麻雀ゲームに参加できる統一インターフェース設計について説明します。

また、ゲーム管理の方式（ローカル、サーバー、P2P）にも依存しない抽象化レイヤーを提供します。

---

## アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────────────┐
│                    Client Implementations                        │
│     (CLI / Web / VR / AI / Remote)                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │   CLI    │  │   Web    │  │    VR    │  │    AI    │       │
│  │  Adapter │  │  Adapter │  │  Adapter │  │  Adapter │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              │
                      Unified API (Commands/Queries/Events)
                              │
┌─────────────────────────────────────────────────────────────────┐
│                       Game Host Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │    Local     │  │    Server    │  │     P2P      │         │
│  │     Host     │  │     Host     │  │     Host     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                       Domain Layer                               │
│                  (Game / Player / Hand / etc.)                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 統一API仕様

### 1. Commands（コマンド）

状態を変更する操作。すべてのコマンドは共通インターフェースを持ちます。

```typescript
interface Command {
  readonly type: string;
  readonly gameId: string;
  readonly playerId?: string;
  readonly timestamp: Date;
}
```

#### 主要コマンド

- **CreateGameCommand**: ゲーム作成
- **JoinGameCommand**: ゲーム参加
- **StartGameCommand**: ゲーム開始
- **DrawTileCommand**: 牌を引く
- **DiscardTileCommand**: 牌を捨てる
- **CallChiCommand**: チー
- **CallPonCommand**: ポン
- **CallMinkanCommand**: 明槓
- **CallAnkanCommand**: 暗槓
- **DeclareRiichiCommand**: リーチ宣言
- **DeclareRonCommand**: ロン和了
- **DeclareTsumoCommand**: ツモ和了

### 2. Queries（クエリ）

状態を読み取る操作。副作用を持ちません。

```typescript
interface Query {
  readonly type: string;
  readonly gameId: string;
  readonly playerId?: string;
}
```

#### 主要クエリ

- **GetGameStateQuery**: ゲーム状態取得
- **GetPlayerInfoQuery**: プレイヤー情報取得
- **GetHandQuery**: 手牌取得
- **GetDiscardsQuery**: 捨て牌取得
- **GetPossibleActionsQuery**: 可能なアクション取得
- **GetDoraIndicatorsQuery**: ドラ表示牌取得
- **GetWaitingTilesQuery**: 待ち牌取得

### 3. Events（イベント）

ゲーム内で発生した出来事の通知。

```typescript
interface GameEvent {
  readonly type: string;
  readonly gameId: string;
  readonly timestamp: Date;
  readonly data: any;
}
```

#### 主要イベント

- **GameStartedEvent**: ゲーム開始
- **TileDrawnEvent**: 牌をツモ
- **TileDiscardedEvent**: 牌を捨てた
- **ChiCalledEvent**: チー
- **PonCalledEvent**: ポン
- **RiichiDeclaredEvent**: リーチ宣言
- **RonWinEvent**: ロン和了
- **TsumoWinEvent**: ツモ和了

---

## GameHost抽象化

ゲーム管理の方式（ローカル、サーバー、P2P）を抽象化します。

```typescript
interface GameHost {
  readonly type: GameHostType;
  readonly id: string;

  connect(): Promise<void>;
  disconnect(): Promise<void>;
  sendCommand(command: GameCommand): Promise<CommandResult>;
  sendQuery<T>(query: GameQuery): Promise<QueryResult<T>>;
  subscribe(eventType: string, handler: (event: GameEvent) => void): void;
  unsubscribe(eventType: string, handler: (event: GameEvent) => void): void;
  isConnected(): boolean;
  getStatus(): HostStatus;
}
```

### 実装

#### 1. LocalGameHost

同一プロセス内でゲームを管理。

**特徴**:
- ネットワーク不要
- レイテンシ0ms
- シングルプレイヤー or ローカルマルチプレイヤー向け
- UIとゲームロジックが同じプロセス

**使用例**:
```typescript
const host = new LocalGameHost('local');
await host.connect();
```

#### 2. ServerGameHost

中央サーバーでゲームを管理。

**特徴**:
- HTTP/WebSocket経由で通信
- サーバーが権威を持つ
- マルチプレイヤー対応
- スケーラブル

**使用例**:
```typescript
const host = new ServerGameHost('https://mahjong-server.com');
await host.connect();
```

#### 3. P2PGameHost

ピアツーピアでゲームを管理。

**特徴**:
- WebRTC経由で通信
- 分散型（中央サーバー不要）
- ホストピアが権威を持つ
- レイテンシが低い

**使用例**:
```typescript
const host = new P2PGameHost('peer-123', 'wss://signal-server.com', true);
await host.connect();
```

---

## PlayerAdapter抽象化

あらゆるプレイヤー実装の統一インターフェース。

```typescript
interface PlayerAdapter {
  readonly type: PlayerAdapterType;
  readonly playerId: string;
  readonly playerName: string;

  connect(host: GameHost, gameId: string): Promise<void>;
  disconnect(): Promise<void>;
  handleEvent(event: GameEvent): void;
  startTurn(): Promise<void>;
  endTurn(): Promise<void>;
  getState(): PlayerAdapterState;
}
```

### 実装

#### 1. CLIPlayerAdapter

ターミナルでのインタラクション。

**特徴**:
- コンソール入出力
- キーボード操作
- テキストベースUI

#### 2. WebPlayerAdapter

ブラウザでのインタラクション。

**特徴**:
- HTML/CSS/JavaScriptによるUI
- マウス/タッチ操作
- グラフィカルな牌表示

#### 3. VRPlayerAdapter

VRデバイスでのインタラクション。

**特徴**:
- 3D空間での麻雀卓
- ハンドトラッキング
- 没入感のある体験

#### 4. AIPlayerAdapter

CPU（AI）プレイヤー。

**特徴**:
- 自動思考と行動
- 難易度設定可能（初級、中級、上級）
- 機械学習モデルの使用可能

---

## 使用例

### 例1: ローカルゲーム（1人 vs 3 AI）

```typescript
import { LocalGameHost } from './infrastructure/hosts/LocalGameHost';
import { CLIPlayerAdapter } from './infrastructure/adapters/CLIPlayerAdapter';
import { SimpleAIPlayerAdapter } from './infrastructure/adapters/SimpleAIPlayerAdapter';

// ホストを作成
const host = new LocalGameHost();
await host.connect();

// プレイヤーを作成
const human = new CLIPlayerAdapter('player1', 'Alice');
const ai1 = new SimpleAIPlayerAdapter('ai1', 'CPU 1');
const ai2 = new SimpleAIPlayerAdapter('ai2', 'CPU 2');
const ai3 = new SimpleAIPlayerAdapter('ai3', 'CPU 3');

// ゲームを作成
const createResult = await host.sendCommand({
  type: 'CreateGame',
  gameId: 'game123',
  playerIds: ['player1', 'ai1', 'ai2', 'ai3'],
  rules: GameRules.createStandard(),
  timestamp: new Date(),
});

const gameId = createResult.data.gameId;

// プレイヤーを接続
await human.connect(host, gameId);
await ai1.connect(host, gameId);
await ai2.connect(host, gameId);
await ai3.connect(host, gameId);

// ゲーム開始
await host.sendCommand({
  type: 'StartGame',
  gameId: gameId,
  timestamp: new Date(),
});

// ゲームループ
while (true) {
  const state = await host.sendQuery({
    type: 'GetGameState',
    gameId: gameId,
  });

  if (state.data.status === 'finished') break;

  const currentPlayerId = state.data.players[state.data.currentPlayerIndex].id;

  if (currentPlayerId === 'player1') {
    await human.startTurn();
  } else {
    const ai = [ai1, ai2, ai3].find(a => a.playerId === currentPlayerId);
    await ai?.startTurn();
  }
}
```

### 例2: オンラインマルチプレイヤー（サーバー経由）

```typescript
import { ServerGameHost } from './infrastructure/hosts/ServerGameHost';
import { WebPlayerAdapter } from './infrastructure/adapters/WebPlayerAdapter';

// サーバーに接続
const host = new ServerGameHost('https://mahjong-server.com');
await host.connect();

// プレイヤーアダプターを作成
const player = new WebPlayerAdapter('player123', 'Bob');

// ゲームに参加
await host.sendCommand({
  type: 'JoinGame',
  gameId: 'online-game-456',
  playerId: 'player123',
  playerName: 'Bob',
  timestamp: new Date(),
});

// プレイヤーを接続
await player.connect(host, 'online-game-456');

// イベント購読
host.subscribe('*', (event) => {
  console.log('Game event:', event);
  player.handleEvent(event);
});

// ゲームが開始されるまで待機
host.subscribe('GameStarted', async (event) => {
  console.log('Game started!');
});
```

### 例3: P2Pマルチプレイヤー

```typescript
import { P2PGameHost } from './infrastructure/hosts/P2PGameHost';
import { WebPlayerAdapter } from './infrastructure/adapters/WebPlayerAdapter';

// ホストとしてP2Pネットワークを作成
const host = new P2PGameHost('peer-host', 'wss://signal.example.com', true);
await host.connect();

const player = new WebPlayerAdapter('peer-host', 'Host Player');
await player.connect(host, 'p2p-game-789');

// 他のプレイヤーの参加を待つ
host.subscribe('PlayerJoined', async (event) => {
  console.log(`Player ${event.data.playerName} joined`);

  // 4人揃ったらゲーム開始
  if (event.data.playersCount === 4) {
    await host.sendCommand({
      type: 'StartGame',
      gameId: 'p2p-game-789',
      timestamp: new Date(),
    });
  }
});
```

### 例4: CLI、Web、AIの混在ゲーム

```typescript
// 同じホストに異なるタイプのプレイヤーを接続
const host = new LocalGameHost();
await host.connect();

// 異なるタイプのプレイヤー
const cliPlayer = new CLIPlayerAdapter('p1', 'CLI Player');
const webPlayer = new WebPlayerAdapter('p2', 'Web Player');
const aiPlayer = new SimpleAIPlayerAdapter('p3', 'AI Player');
const vrPlayer = new VRPlayerAdapter('p4', 'VR Player');

// すべて同じAPIで参加
await cliPlayer.connect(host, gameId);
await webPlayer.connect(host, gameId);
await aiPlayer.connect(host, gameId);
await vrPlayer.connect(host, gameId);

// ゲームフローは同じ
```

---

## 利点

### 1. インターフェース統一

- **どのUIからでも参加可能**: CLI、Web、VR、モバイルなど
- **同じAPIで一貫性**: コマンド、クエリ、イベントの統一インターフェース
- **実装の切り替えが容易**: ローカル↔サーバー↔P2Pの切り替えが簡単

### 2. 柔軟性

- **ホスト方式の選択**: ゲームの性質に応じて最適な方式を選択
  - シングルプレイ → Local
  - オンライン対戦 → Server
  - 友達同士 → P2P
- **プレイヤータイプの混在**: 人間とAIの混在、異なるUIの混在

### 3. 拡張性

- **新しいUI追加が容易**: PlayerAdapterを実装するだけ
- **新しいホスト方式追加が容易**: GameHostを実装するだけ
- **ドメインロジックに影響しない**: UIとホスト方式はドメイン層から完全に分離

### 4. テスタビリティ

- **モック化が容易**: インターフェースベースなのでモック実装が簡単
- **単体テスト**: 各レイヤーを独立してテスト可能
- **統合テスト**: LocalHostを使って高速にテスト可能

---

## 実装ガイドライン

### 新しいPlayerAdapterを追加する場合

1. `PlayerAdapter`インターフェースを実装
2. `HumanPlayerAdapter`または`AIPlayerAdapter`を継承
3. `handleEvent()`で画面更新ロジックを実装
4. `startTurn()`でユーザー入力を受け付け

```typescript
export class MyCustomPlayerAdapter extends HumanPlayerAdapter {
  readonly type = PlayerAdapterType.WEB; // or VR, MOBILE, etc.

  handleEvent(event: GameEvent): void {
    // UIを更新
  }

  async startTurn(): Promise<void> {
    // ユーザー入力を待つ
    // コマンドを送信
  }
}
```

### 新しいGameHostを追加する場合

1. `GameHost`インターフェースを実装
2. `sendCommand()`と`sendQuery()`で通信ロジックを実装
3. イベント購読の仕組みを実装
4. 再接続やエラーハンドリングを実装

```typescript
export class MyCustomGameHost implements GameHost {
  readonly type = GameHostType.CUSTOM;

  async connect(): Promise<void> {
    // 接続ロジック
  }

  async sendCommand(command: GameCommand): Promise<CommandResult> {
    // コマンド送信ロジック
  }

  async sendQuery<T>(query: GameQuery): Promise<QueryResult<T>> {
    // クエリ送信ロジック
  }
}
```

---

## 通信プロトコル

### HTTP/REST（Serverの場合）

```
POST /api/games/:gameId/commands
Content-Type: application/json

{
  "type": "DiscardTile",
  "playerId": "player123",
  "tileId": "tile-456",
  "timestamp": "2025-11-05T12:34:56Z"
}

Response:
{
  "success": true,
  "data": { ... }
}
```

### WebSocket（Serverの場合）

```javascript
// コマンド送信
ws.send(JSON.stringify({
  type: 'command',
  requestId: 'req-123',
  command: {
    type: 'DiscardTile',
    playerId: 'player123',
    tileId: 'tile-456',
    timestamp: '2025-11-05T12:34:56Z'
  }
}));

// イベント受信
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'event') {
    handleGameEvent(message.event);
  }
};
```

### WebRTC Data Channel（P2Pの場合）

```javascript
// データチャネル経由でコマンド送信
dataChannel.send(JSON.stringify({
  type: 'command',
  command: { ... }
}));

// データチャネル経由でイベント受信
dataChannel.onmessage = (event) => {
  const message = JSON.parse(event.data);
  handleMessage(message);
};
```

---

## セキュリティ考慮事項

### 1. コマンドの検証

- **サーバー側で必ず検証**: クライアントの送信内容は信用しない
- **ターンチェック**: 現在のプレイヤー以外のコマンドは拒否
- **アクション可能性チェック**: そのアクションが実行可能か検証

### 2. 不正防止

- **手牌の非公開**: 自分の手牌以外は見えない
- **チート検出**: 不正な牌の使用を検出
- **レート制限**: 短時間に大量のコマンドを送信できないようにする

### 3. 認証・認可

- **プレイヤー認証**: JWTなどでプレイヤーを識別
- **ゲームアクセス制御**: 参加者のみがゲームにアクセスできる

---

## パフォーマンス最適化

### 1. クエリの最適化

- **必要な情報のみ取得**: 全体状態ではなく差分のみ
- **キャッシング**: 頻繁にアクセスされる情報をキャッシュ
- **バッチクエリ**: 複数のクエリを1回の通信で実行

### 2. イベント配信の最適化

- **選択的購読**: 必要なイベントのみ購読
- **イベントフィルタリング**: 関連するイベントのみ配信
- **バッファリング**: 連続するイベントをまとめて配信

### 3. ネットワーク最適化

- **圧縮**: メッセージを圧縮（gzip、MessagePack）
- **Binary Protocol**: JSONではなくバイナリプロトコルを使用
- **接続プーリング**: 接続の再利用

---

## まとめ

この統一API設計により、以下が実現されます：

1. **UI実装の自由度**: CLI、Web、VR、モバイルなど、どんなUIでも参加可能
2. **ホスト方式の柔軟性**: ローカル、サーバー、P2Pから選択可能
3. **実装の独立性**: ドメインロジック、UI、通信層が完全に分離
4. **拡張性**: 新しいUIやホスト方式の追加が容易
5. **テスタビリティ**: 各レイヤーを独立してテスト可能

すべてのクライアントが同じゲームに参加でき、どこでゲームを管理するか（ローカル、サーバー、P2P）も自由に選択できる、真に**ユニバーサル**な麻雀プラットフォームの基盤が完成しました。
