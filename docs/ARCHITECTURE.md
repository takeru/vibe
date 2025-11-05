# 麻雀ゲーム - アーキテクチャ設計

## 概要

本ドキュメントでは、麻雀ゲームのアーキテクチャ設計について説明します。ドメイン駆動設計（DDD）とクリーンアーキテクチャの原則に基づいています。

---

## レイヤードアーキテクチャ

```
┌─────────────────────────────────────────────────────────┐
│                   Presentation Layer                     │
│                    (UI / CLI / Web)                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │  - React Components (Web)                       │   │
│  │  - Ink Components (CLI)                         │   │
│  │  - View Models                                  │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓↑
┌─────────────────────────────────────────────────────────┐
│                  Application Layer                       │
│              (Use Cases / Commands / Queries)            │
│  ┌─────────────────────────────────────────────────┐   │
│  │  - StartGameUseCase                             │   │
│  │  - DrawTileUseCase                              │   │
│  │  - DiscardTileUseCase                           │   │
│  │  - CallMeldUseCase                              │   │
│  │  - DeclareRiichiUseCase                         │   │
│  │  - WinGameUseCase                               │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓↑
┌─────────────────────────────────────────────────────────┐
│                    Domain Layer                          │
│            (Business Logic / Domain Model)               │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Entities:                                       │   │
│  │    - Game (Aggregate Root)                      │   │
│  │    - Player                                     │   │
│  │    - Hand                                       │   │
│  │    - Round                                      │   │
│  │    - Wall                                       │   │
│  │                                                  │   │
│  │  Value Objects:                                 │   │
│  │    - Tile                                       │   │
│  │    - Meld                                       │   │
│  │    - Yaku                                       │   │
│  │    - WinningHand                                │   │
│  │    - GameRules                                  │   │
│  │                                                  │   │
│  │  Domain Services:                               │   │
│  │    - ScoringService                             │   │
│  │    - YakuDetectionService                       │   │
│  │    - WinningHandAnalyzer                        │   │
│  │    - RoundManager                               │   │
│  │                                                  │   │
│  │  Domain Events:                                 │   │
│  │    - GameStartedEvent                           │   │
│  │    - TileDrawnEvent                             │   │
│  │    - TileDiscardedEvent                         │   │
│  │    - RonWinEvent, etc.                          │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓↑
┌─────────────────────────────────────────────────────────┐
│                 Infrastructure Layer                     │
│          (Persistence / External Services)               │
│  ┌─────────────────────────────────────────────────┐   │
│  │  - GameRepository (save/load games)             │   │
│  │  - EventStore (event sourcing)                  │   │
│  │  - Logger                                       │   │
│  │  - Network (multiplayer)                        │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## ドメイン駆動設計（DDD）パターン

### 1. 集約（Aggregate）

**Game集約**は最も重要な集約ルートです。

```
Game (Aggregate Root)
├── Player[]
│   └── Hand
│       ├── concealedTiles: Tile[]
│       └── melds: Meld[]
├── Round
├── Wall
└── GameRules
```

**集約の境界**:
- `Game`の外部から`Player`や`Hand`を直接変更してはいけない
- 全ての変更は`Game`を通して行う
- これにより、ゲームの整合性が保たれる

**例**:
```typescript
// ❌ BAD: 集約の外から直接変更
player.hand.addTile(tile);

// ✅ GOOD: 集約ルートを通して変更
game.drawTile(playerId);
```

### 2. 値オブジェクト（Value Object）

**特徴**:
- 不変（Immutable）
- 等価性は値で判定
- ライフサイクルを持たない

**例**:
```typescript
const tile1 = new Tile(TileSuit.MAN, 5);
const tile2 = new Tile(TileSuit.MAN, 5);

tile1.equals(tile2); // true（値が同じ）
tile1 === tile2;      // false（別インスタンス）

// 不変性
tile1.value = 6; // ❌ コンパイルエラー（readonly）
```

### 3. エンティティ（Entity）

**特徴**:
- 一意性（Identity）を持つ
- ライフサイクルを持つ
- 同じ属性でもIDが異なれば別物

**例**:
```typescript
const player1 = new Player('p1', 'Alice', 0);
const player2 = new Player('p2', 'Alice', 0);

player1.name === player2.name; // true（名前は同じ）
player1.id === player2.id;     // false（別のプレイヤー）
```

### 4. ドメインサービス（Domain Service）

**用途**:
- 複数のエンティティにまたがるロジック
- エンティティに属さない処理

**例**:
```typescript
// 点数計算は複数の要素（手牌、役、ドラ、風、ルール）にまたがる
class ScoringService {
  calculateScore(
    winningHand: WinningHand,
    yaku: Yaku[],
    doraCount: number,
    isDealer: boolean,
    seatWind: Wind,
    prevalentWind: Wind
  ): ScoreCalculation {
    // 複雑な計算ロジック
  }
}
```

### 5. ドメインイベント（Domain Event）

**用途**:
- ドメイン内で発生した重要な出来事を記録
- 疎結合なコンポーネント間通信

**メリット**:
- イベントソーシング（Event Sourcing）の実装が可能
- タイムトラベルデバッグ
- リプレイ機能
- 統計・分析

**例**:
```typescript
// イベント発行
eventPublisher.publish({
  eventType: 'TileDiscarded',
  timestamp: new Date(),
  aggregateId: gameId,
  playerId: player.id,
  tile: discardedTile,
});

// イベント購読
eventPublisher.subscribe('TileDiscarded', (event) => {
  logger.log(`${event.playerId} が ${event.tile} を捨てました`);
  ui.updateDiscards(event.playerId, event.tile);
});
```

---

## CQRS（Command Query Responsibility Segregation）

コマンド（書き込み）とクエリ（読み込み）を分離します。

### Commands（コマンド）

状態を変更する操作。

```typescript
interface DrawTileCommand {
  gameId: string;
  playerId: string;
}

interface DiscardTileCommand {
  gameId: string;
  playerId: string;
  tileId: string;
}

interface DeclareRiichiCommand {
  gameId: string;
  playerId: string;
}
```

### Queries（クエリ）

状態を読み取る操作。

```typescript
interface GetGameStateQuery {
  gameId: string;
}

interface GetPlayerHandQuery {
  gameId: string;
  playerId: string;
}

interface GetPossibleActionsQuery {
  gameId: string;
  playerId: string;
}
```

### メリット

- 読み書きの最適化を個別に行える
- 複雑な読み取りロジックをドメインから分離
- スケーラビリティの向上

---

## ユースケース駆動設計

### ユースケースの構造

```typescript
interface UseCase<TRequest, TResponse> {
  execute(request: TRequest): Promise<TResponse>;
}
```

### 主要ユースケース

#### 1. StartGameUseCase

```typescript
class StartGameUseCase implements UseCase<StartGameRequest, StartGameResponse> {
  constructor(
    private gameRepository: GameRepository,
    private eventPublisher: DomainEventPublisher
  ) {}

  async execute(request: StartGameRequest): Promise<StartGameResponse> {
    // 1. ゲームを作成
    const players = request.playerNames.map((name, i) =>
      new Player(generateId(), name, i, request.rules.initialScore)
    );

    const game = new Game(generateId(), players, request.rules);

    // 2. ゲームを開始
    game.start();

    // 3. イベント発行
    this.eventPublisher.publish({
      eventType: 'GameStarted',
      timestamp: new Date(),
      aggregateId: game.id,
      players: game.players,
    });

    // 4. 永続化
    await this.gameRepository.save(game);

    // 5. レスポンス
    return {
      gameId: game.id,
      initialState: game.toJSON(),
    };
  }
}
```

#### 2. DrawTileUseCase

```typescript
class DrawTileUseCase implements UseCase<DrawTileRequest, DrawTileResponse> {
  constructor(
    private gameRepository: GameRepository,
    private eventPublisher: DomainEventPublisher
  ) {}

  async execute(request: DrawTileRequest): Promise<DrawTileResponse> {
    // 1. ゲームを取得
    const game = await this.gameRepository.findById(request.gameId);
    if (!game) throw new Error('Game not found');

    // 2. 現在のプレイヤーを確認
    const currentPlayer = game.getCurrentPlayer();
    if (currentPlayer.id !== request.playerId) {
      throw new Error('Not your turn');
    }

    // 3. 牌を引く
    const tile = game.wall.drawTile();
    if (!tile) {
      // 流局処理
      return this.handleExhaustiveDraw(game);
    }

    currentPlayer.drawTile(tile);

    // 4. イベント発行
    this.eventPublisher.publish({
      eventType: 'TileDrawn',
      timestamp: new Date(),
      aggregateId: game.id,
      playerId: currentPlayer.id,
      tile: tile,
      isRinshan: false,
    });

    // 5. 可能なアクションを判定
    const possibleActions = this.determinePossibleActions(game, currentPlayer, tile);

    // 6. 永続化
    await this.gameRepository.save(game);

    // 7. レスポンス
    return {
      drawnTile: tile,
      possibleActions: possibleActions,
      gameState: game.toJSON(),
    };
  }

  private determinePossibleActions(
    game: Game,
    player: Player,
    drawnTile: Tile
  ): string[] {
    const actions: string[] = ['discard'];

    // ツモ和了可能か
    const winningHand = new WinningHand(
      player.hand.concealedTiles,
      player.hand.melds,
      drawnTile,
      WinType.TSUMO
    );
    if (winningHand.isWinning()) {
      actions.push('tsumo');
    }

    // リーチ可能か
    if (player.isConcealed() && player.score >= 1000) {
      const analyzer = new WinningHandAnalyzer();
      if (analyzer.isTenpai(player.hand.concealedTiles)) {
        actions.push('riichi');
      }
    }

    // 暗槓可能か
    const ankanTiles = player.hand.canAnkan();
    if (ankanTiles.length > 0) {
      actions.push('ankan');
    }

    // 加槓可能か
    const kakanOptions = player.hand.canKakan();
    if (kakanOptions.length > 0) {
      actions.push('kakan');
    }

    return actions;
  }
}
```

#### 3. DiscardTileUseCase

```typescript
class DiscardTileUseCase implements UseCase<DiscardTileRequest, DiscardTileResponse> {
  constructor(
    private gameRepository: GameRepository,
    private eventPublisher: DomainEventPublisher
  ) {}

  async execute(request: DiscardTileRequest): Promise<DiscardTileResponse> {
    // 1. ゲームを取得
    const game = await this.gameRepository.findById(request.gameId);
    if (!game) throw new Error('Game not found');

    // 2. 牌を捨てる
    const currentPlayer = game.getCurrentPlayer();
    const discardedTile = currentPlayer.discardTile(request.tileId);
    if (!discardedTile) throw new Error('Tile not found');

    // 3. イベント発行
    this.eventPublisher.publish({
      eventType: 'TileDiscarded',
      timestamp: new Date(),
      aggregateId: game.id,
      playerId: currentPlayer.id,
      tile: discardedTile,
      isRiichi: request.isRiichi ?? false,
      isTsumogiri: false,
    });

    // 4. 他プレイヤーの可能なアクションを判定
    const callableActions = this.determineCallableActions(
      game,
      currentPlayer,
      discardedTile
    );

    // 5. 永続化
    await this.gameRepository.save(game);

    // 6. レスポンス
    return {
      discardedTile: discardedTile,
      callableActions: callableActions,
      gameState: game.toJSON(),
    };
  }

  private determineCallableActions(
    game: Game,
    discardingPlayer: Player,
    discardedTile: Tile
  ): CallableAction[] {
    const actions: CallableAction[] = [];

    for (const player of game.players) {
      if (player.id === discardingPlayer.id) continue;

      // ロン可能か
      const winningHand = new WinningHand(
        player.hand.concealedTiles,
        player.hand.melds,
        discardedTile,
        WinType.RON
      );
      if (winningHand.isWinning() && !player.furiten) {
        actions.push({
          type: 'ron',
          playerId: player.id,
          priority: 10, // ロンは最優先
        });
      }

      // ポン可能か
      if (player.hand.canPon(discardedTile)) {
        actions.push({
          type: 'pon',
          playerId: player.id,
          priority: 5,
        });
      }

      // チー可能か（上家のみ）
      if (player.isKamicha(discardingPlayer.seat) &&
          player.hand.canChi(discardedTile)) {
        actions.push({
          type: 'chi',
          playerId: player.id,
          priority: 3,
        });
      }

      // 明槓可能か
      if (player.hand.canMinkan(discardedTile)) {
        actions.push({
          type: 'minkan',
          playerId: player.id,
          priority: 7,
        });
      }
    }

    return actions;
  }
}
```

---

## リポジトリパターン

### インターフェース

```typescript
interface GameRepository {
  save(game: Game): Promise<void>;
  findById(id: string): Promise<Game | null>;
  findAll(): Promise<Game[]>;
  delete(id: string): Promise<void>;
}
```

### 実装例（メモリ内）

```typescript
class InMemoryGameRepository implements GameRepository {
  private games: Map<string, Game> = new Map();

  async save(game: Game): Promise<void> {
    this.games.set(game.id, game.clone());
  }

  async findById(id: string): Promise<Game | null> {
    const game = this.games.get(id);
    return game ? game.clone() : null;
  }

  async findAll(): Promise<Game[]> {
    return Array.from(this.games.values()).map(g => g.clone());
  }

  async delete(id: string): Promise<void> {
    this.games.delete(id);
  }
}
```

### 実装例（JSON File）

```typescript
class JsonFileGameRepository implements GameRepository {
  constructor(private dataDir: string) {}

  async save(game: Game): Promise<void> {
    const json = JSON.stringify(game.toJSON(), null, 2);
    await fs.writeFile(`${this.dataDir}/${game.id}.json`, json);
  }

  async findById(id: string): Promise<Game | null> {
    try {
      const json = await fs.readFile(`${this.dataDir}/${id}.json`, 'utf-8');
      return Game.fromJSON(JSON.parse(json));
    } catch {
      return null;
    }
  }

  async findAll(): Promise<Game[]> {
    const files = await fs.readdir(this.dataDir);
    const games = await Promise.all(
      files
        .filter(f => f.endsWith('.json'))
        .map(f => this.findById(f.replace('.json', '')))
    );
    return games.filter((g): g is Game => g !== null);
  }

  async delete(id: string): Promise<void> {
    await fs.unlink(`${this.dataDir}/${id}.json`);
  }
}
```

---

## イベントソーシング

### イベントストア

```typescript
interface EventStore {
  append(event: DomainEvent): Promise<void>;
  getEvents(aggregateId: string): Promise<DomainEvent[]>;
  getAllEvents(): Promise<DomainEvent[]>;
}
```

### ゲーム状態の再構築

```typescript
class GameEventSourcing {
  constructor(private eventStore: EventStore) {}

  async reconstructGame(gameId: string): Promise<Game> {
    // 1. 全イベントを取得
    const events = await this.eventStore.getEvents(gameId);

    // 2. 初期状態から順にイベントを適用
    let game: Game | null = null;

    for (const event of events) {
      switch (event.eventType) {
        case 'GameStarted':
          game = this.createGameFromEvent(event as GameStartedEvent);
          break;

        case 'TileDrawn':
          game = this.applyTileDrawn(game!, event as TileDrawnEvent);
          break;

        case 'TileDiscarded':
          game = this.applyTileDiscarded(game!, event as TileDiscardedEvent);
          break;

        // その他のイベント...
      }
    }

    if (!game) throw new Error('Game not found');
    return game;
  }

  private createGameFromEvent(event: GameStartedEvent): Game {
    // イベントから初期ゲーム状態を復元
    // ...
  }

  private applyTileDrawn(game: Game, event: TileDrawnEvent): Game {
    // イベントを適用して新しい状態を返す
    // ...
  }
}
```

### メリット

- **完全な履歴**: 全ての変更履歴が残る
- **タイムトラベル**: 任意の時点の状態を再現可能
- **監査**: いつ、誰が、何をしたか追跡可能
- **リプレイ**: ゲームの再生が可能
- **デバッグ**: バグの再現が容易

---

## 依存性注入（DI）

### DIコンテナ

```typescript
class Container {
  private services: Map<string, any> = new Map();

  register<T>(name: string, factory: () => T): void {
    this.services.set(name, factory);
  }

  resolve<T>(name: string): T {
    const factory = this.services.get(name);
    if (!factory) throw new Error(`Service not found: ${name}`);
    return factory();
  }
}

// セットアップ
const container = new Container();

container.register('GameRepository', () =>
  new JsonFileGameRepository('./data/games')
);

container.register('EventStore', () =>
  new FileEventStore('./data/events')
);

container.register('DomainEventPublisher', () =>
  DomainEventPublisher.getInstance()
);

container.register('StartGameUseCase', () =>
  new StartGameUseCase(
    container.resolve('GameRepository'),
    container.resolve('DomainEventPublisher')
  )
);

// 使用
const useCase = container.resolve<StartGameUseCase>('StartGameUseCase');
```

---

## テスト戦略

### 1. ユニットテスト

ドメインロジックを個別にテスト。

```typescript
describe('Tile', () => {
  test('should identify terminal tiles', () => {
    const tile1 = new Tile(TileSuit.MAN, 1);
    const tile2 = new Tile(TileSuit.MAN, 5);
    const tile3 = new Tile(TileSuit.HONOR, 1);

    expect(tile1.isTerminal()).toBe(true);
    expect(tile2.isTerminal()).toBe(false);
    expect(tile3.isTerminal()).toBe(true);
  });

  test('should get next tile correctly', () => {
    const tile = new Tile(TileSuit.PIN, 5);
    const next = tile.next();

    expect(next?.suit).toBe(TileSuit.PIN);
    expect(next?.value).toBe(6);
  });
});
```

### 2. 統合テスト

ユースケース全体をテスト。

```typescript
describe('DrawTileUseCase', () => {
  test('should allow player to draw tile and discard', async () => {
    const repository = new InMemoryGameRepository();
    const eventPublisher = DomainEventPublisher.getInstance();
    const useCase = new DrawTileUseCase(repository, eventPublisher);

    // ゲーム作成
    const game = createTestGame();
    await repository.save(game);

    // 牌を引く
    const result = await useCase.execute({
      gameId: game.id,
      playerId: game.getCurrentPlayer().id,
    });

    expect(result.drawnTile).toBeDefined();
    expect(result.possibleActions).toContain('discard');
  });
});
```

### 3. E2Eテスト

ゲーム全体のフローをテスト。

```typescript
describe('Full game flow', () => {
  test('should complete a full game', async () => {
    // ゲーム開始
    const startResult = await startGameUseCase.execute({
      playerNames: ['Alice', 'Bob', 'Charlie', 'Dave'],
      rules: GameRules.createStandard(),
    });

    let gameId = startResult.gameId;

    // 各ターンを実行
    for (let turn = 0; turn < 100; turn++) {
      const game = await repository.findById(gameId);
      const currentPlayer = game.getCurrentPlayer();

      // ツモ
      await drawTileUseCase.execute({ gameId, playerId: currentPlayer.id });

      // 捨てる
      await discardTileUseCase.execute({
        gameId,
        playerId: currentPlayer.id,
        tileId: currentPlayer.hand.concealedTiles[0].id,
      });

      if (game.isFinished()) break;
    }

    const finalGame = await repository.findById(gameId);
    expect(finalGame.status).toBe(GameStatus.FINISHED);
  });
});
```

---

## パフォーマンス最適化

### 1. 待ち牌判定の最適化

```typescript
// ナイーブな実装: O(n!) - 全探索
function findWaitingTilesNaive(tiles: Tile[]): Tile[] {
  // 全ての可能な牌を試す（136枚）
  // 各牌で和了形判定（指数時間）
}

// 最適化版: O(n) - 向聴数計算アルゴリズム
function findWaitingTilesOptimized(tiles: Tile[]): Tile[] {
  // 向聴数を計算し、-1向聴の牌のみ返す
  // 詳細は専門アルゴリズム（牌理論）を参照
}
```

### 2. メモ化

```typescript
class YakuDetectionService {
  private cache: Map<string, Yaku[]> = new Map();

  detectYaku(winningHand: WinningHand, context: Context): Yaku[] {
    const key = this.createCacheKey(winningHand, context);

    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const yaku = this.doDetectYaku(winningHand, context);
    this.cache.set(key, yaku);
    return yaku;
  }
}
```

---

## まとめ

本アーキテクチャは以下の特徴を持ちます：

- **関心の分離**: レイヤー間の責務が明確
- **テスタビリティ**: 各層が独立してテスト可能
- **拡張性**: 新機能の追加が容易
- **保守性**: コードの理解と修正が容易
- **スケーラビリティ**: 将来的な規模拡大に対応可能

ドメイン駆動設計とクリーンアーキテクチャの原則に従うことで、複雑な麻雀のルールを適切に表現し、長期的に保守可能なシステムを構築できます。
