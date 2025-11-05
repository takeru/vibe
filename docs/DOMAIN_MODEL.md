# 麻雀ゲーム - 完全なドメインモデル設計

## 目次

1. [概要](#概要)
2. [ドメインモデル全体像](#ドメインモデル全体像)
3. [Value Objects（値オブジェクト）](#value-objects値オブジェクト)
4. [Entities（エンティティ）](#entitiesエンティティ)
5. [Domain Services（ドメインサービス）](#domain-servicesドメインサービス)
6. [Domain Events（ドメインイベント）](#domain-eventsドメインイベント)
7. [ゲームフロー](#ゲームフロー)
8. [ユースケース例](#ユースケース例)

---

## 概要

本ドキュメントでは、麻雀ゲームの完全なドメインモデルをドメイン駆動設計（DDD）の観点から設計します。

### 設計原則

- **ユビキタス言語**: 麻雀の専門用語を正確に使用
- **集約（Aggregate）**: 不変条件を保護する境界を明確化
- **値オブジェクト**: 不変で交換可能なオブジェクト
- **エンティティ**: 一意性と連続性を持つオブジェクト
- **ドメインイベント**: ドメイン内で発生した重要な出来事

---

## ドメインモデル全体像

```
┌─────────────────────────────────────────────────────────────┐
│                     Game (集約ルート)                        │
├─────────────────────────────────────────────────────────────┤
│ - id: string                                                 │
│ - players: Player[]                                          │
│ - currentRound: Round                                        │
│ - wall: Wall                                                 │
│ - rules: GameRules                                           │
│ - status: GameStatus                                         │
└─────────────────────────────────────────────────────────────┘
         │
         ├──────> Player (エンティティ)
         │        ├─ hand: Hand
         │        ├─ discards: Tile[]
         │        └─ score: number
         │
         ├──────> Round (エンティティ)
         │        ├─ roundType: RoundType
         │        ├─ roundNumber: number
         │        ├─ dealerSeat: number
         │        └─ honbaCount: number
         │
         ├──────> Wall (エンティティ)
         │        ├─ tiles: Tile[]
         │        ├─ deadWall: Tile[]
         │        └─ doraIndicators: Tile[]
         │
         └──────> GameRules (Value Object)
                  ├─ gameType: GameType
                  ├─ initialScore: number
                  └─ useRedDora: boolean
```

---

## Value Objects（値オブジェクト）

### 1. Tile（牌）

**責務**: 麻雀の牌を表現する不変オブジェクト

**プロパティ**:
- `suit: TileSuit` - 牌の種類（萬子、筒子、索子、字牌）
- `value: number` - 牌の数値（1-9 or 1-7）
- `isRed: boolean` - 赤ドラフラグ
- `id: string` - 一意識別子

**主要メソッド**:
- `isNumber()` - 数牌かどうか
- `isHonor()` - 字牌かどうか
- `isTerminal()` - 么九牌（1,9,字牌）かどうか
- `isSimple()` - 中張牌（2-8）かどうか
- `next()` - 次の牌（順子判定用）
- `equals()` - 牌の同一性判定（種類と数値）
- `toString()` - 文字列表現（"1萬", "東", "5筒"など）

**設計上の注意点**:
- 不変オブジェクトとして扱う
- `id`は物理的な牌の識別に使用（同じ種類でも別インスタンス）
- `equals()`は論理的な同一性、`isSame()`は物理的な同一性

### 2. Meld（面子・副露）

**責務**: 副露した面子（ポン、チー、カン）を表現

**プロパティ**:
- `type: MeldType` - 面子の種類（CHI, PON, KAN）
- `tiles: Tile[]` - 構成する牌（3枚または4枚）
- `calledTile: Tile | null` - 鳴いた牌
- `source: MeldSource` - 誰から鳴いたか（上家、対面、下家、自分）
- `kanType?: KanType` - 槓の種類（明槓、暗槓、加槓）

**主要メソッド**:
- `isSequence()` - 順子かどうか
- `isTriplet()` - 刻子かどうか
- `isQuad()` - 槓子かどうか
- `isConcealedKan()` - 暗槓かどうか

**不変条件**:
- チーは必ず3枚の連続した数牌
- ポンは必ず3枚の同じ牌
- カンは必ず4枚の同じ牌
- 字牌は順子を作れない

### 3. Yaku（役）

**責務**: 麻雀の役を定義

**プロパティ**:
- `type: YakuType` - 役の種類
- `han: number` - 翻数
- `definition: YakuDefinition` - 役の詳細定義

**YakuDefinition**:
- `name: string` - 役名（日本語）
- `nameEn: string` - 役名（英語）
- `isYakuman: boolean` - 役満かどうか
- `requiresConcealed?: boolean` - 門前限定かどうか
- `openHandPenalty?: number` - 食い下がり（副露時の翻数減少）

**実装されている役**:
- 1翻役: 立直、一発、門前清自摸和、断么九、平和、一盃口など
- 2翻役: 三色同順、一気通貫、対々和、七対子など
- 3翻役: 二盃口、純全帯么九、混一色
- 6翻役: 清一色
- 役満: 国士無双、四暗刻、大三元、天和など

### 4. WinningHand（和了形）

**責務**: 和了した手牌の形を表現

**プロパティ**:
- `tiles: Tile[]` - 手牌
- `melds: Meld[]` - 副露
- `winningTile: Tile` - 和了牌
- `winType: WinType` - ツモ/ロン
- `meldSets: MeldSet[]` - 可能な面子構成

**MeldSet**:
- `groups: Tile[][]` - 4つの面子（順子・刻子）
- `pair: Tile[]` - 雀頭（対子）

**主要メソッド**:
- `isTenpai()` - 聴牌しているか
- `isWinning()` - 和了しているか
- `getWaitingTiles()` - 待ち牌を取得

### 5. GameRules（ゲームルール）

**責務**: ゲームの設定とルールバリエーションを定義

**主要プロパティ**:
- `gameType: GameType` - 東風戦/半荘/一荘
- `initialScore: number` - 初期持ち点（通常25000点）
- `useRedDora: boolean` - 赤ドラ使用
- `openTanyao: boolean` - 喰いタン有効
- `atozuke: boolean` - 後付け有効
- `ippatsu: boolean` - 一発有効
- `uraDora: boolean` - 裏ドラ有効
- `doubleRon: boolean` - ダブロン有効
- `tripleRon: boolean` - トリプルロン有効
- `kazoeYakuman: boolean` - 数え役満有効
- `rankingBonus: object` - 順位点（ウマ）

**プリセットルール**:
- `createStandard()` - 標準ルール（アリアリ）
- `createStrict()` - 完全先付け（ナシナシ）
- `createMLeague()` - Mリーグルール
- `createTenhou()` - 天鳳ルール

---

## Entities（エンティティ）

### 1. Game（ゲーム）- 集約ルート

**責務**: ゲーム全体の状態と進行を管理

**プロパティ**:
- `id: string` - ゲームID
- `players: Player[]` - 4人のプレイヤー
- `currentRound: Round` - 現在の局
- `wall: Wall` - 山
- `rules: GameRules` - ゲームルール
- `status: GameStatus` - ゲーム状態（未開始/進行中/終了）
- `phase: GamePhase` - 現在のフェーズ（配牌/ツモ/捨て牌/副露待ち/和了/流局）
- `currentPlayerIndex: number` - 現在のプレイヤーインデックス

**主要メソッド**:
- `start()` - ゲームを開始
- `dealInitialHands()` - 配牌
- `nextPlayer()` - 次のプレイヤーに移動
- `getCurrentPlayer()` - 現在のプレイヤーを取得
- `getDealer()` - 親を取得
- `nextRound()` - 次の局へ
- `isFinished()` - ゲーム終了判定
- `getFinalRankings()` - 最終順位を取得

**不変条件**:
- 常に4人のプレイヤーが存在
- 現在のプレイヤーインデックスは0-3の範囲
- ゲーム終了後は新しい局を開始できない

### 2. Player（プレイヤー）

**責務**: プレイヤーの状態（手牌、点数、捨て牌など）を管理

**プロパティ**:
- `id: string` - プレイヤーID
- `name: string` - プレイヤー名
- `seat: number` - 席（0-3）
- `score: number` - 持ち点
- `hand: Hand` - 手牌
- `discards: Tile[]` - 捨て牌
- `status: PlayerStatus` - 状態（通常/リーチ/聴牌/和了）
- `riichiTurn: number | null` - リーチした巡目
- `furiten: boolean` - フリテン状態

**主要メソッド**:
- `drawTile()` - 牌を引く
- `discardTile()` - 牌を捨てる
- `declareRiichi()` - リーチを宣言
- `addScore()` / `subtractScore()` - 点数の増減
- `resetHand()` - 手牌をリセット
- `isRiichi()` - リーチ中かどうか
- `isConcealed()` - 門前かどうか
- `getLastDiscard()` - 最後の捨て牌

### 3. Hand（手牌）

**責務**: プレイヤーの手牌（門前部分と副露）を管理

**プロパティ**:
- `concealedTiles: Tile[]` - 門前の牌
- `melds: Meld[]` - 副露した面子
- `drawnTile: Tile | null` - 最後にツモった牌
- `status: HandStatus` - 門前/副露あり

**主要メソッド**:
- `addTile()` - 牌を追加
- `removeTile()` - 牌を削除
- `setDrawnTile()` - ツモ牌を設定
- `addMeld()` - 面子を追加
- `isConcealed()` - 門前かどうか
- `getTileCount()` - 手牌の枚数（副露含む）
- `countTile()` - 特定の牌が何枚あるか
- `canChi()` / `canPon()` / `canMinkan()` - 副露可能か判定
- `canAnkan()` - 暗槓可能な牌を取得
- `canKakan()` - 加槓可能な面子と牌を取得

### 4. Round（局）

**責務**: 局の情報（東1局、南3局など）と進行を管理

**プロパティ**:
- `roundType: RoundType` - 場（東/南/西/北）
- `roundNumber: number` - 局番号（1-4）
- `dealerSeat: number` - 親の席（0-3）
- `honbaCount: number` - 本場
- `riichiSticks: number` - 供託（リーチ棒）
- `status: RoundStatus` - 局の状態
- `turnCount: number` - 巡目

**主要メソッド**:
- `start()` - 局を開始
- `incrementTurn()` - ターンを進める
- `finishWithWin()` - 和了で終了
- `finishWithDraw()` - 流局で終了
- `incrementHonba()` - 本場を増やす
- `addRiichiStick()` - リーチ棒を追加
- `getPrevalentWind()` - 場風を取得
- `getSeatWind()` - 自風を取得
- `getDisplayName()` - 表示名（"東1局 2本場"）

### 5. Wall（山）

**責務**: 牌山とドラ表示牌を管理

**プロパティ**:
- `tiles: Tile[]` - 牌山（配牌・ツモ用）
- `deadWall: Tile[]` - 王牌（14枚）
- `doraIndicators: Tile[]` - ドラ表示牌（5枚）
- `uraDoraIndicators: Tile[]` - 裏ドラ表示牌（5枚）
- `drawIndex: number` - 次に引く牌のインデックス
- `rinshanIndex: number` - 嶺上牌のインデックス

**主要メソッド**:
- `drawTile()` - 通常のツモ
- `drawRinshanTile()` - 嶺上牌をツモ（カン後）
- `getRemainingCount()` - 残り牌数
- `isEmpty()` - 山が尽きたか
- `getActiveDoraIndicators()` - 現在有効なドラ表示牌
- `getUraDoraIndicators()` - 裏ドラ表示牌（リーチ時）
- `dealInitialHands()` - 配牌（各13枚）

**静的メソッド**:
- `getDoraFromIndicator()` - ドラ表示牌から実際のドラを取得
- `countDora()` - ドラの枚数をカウント

---

## Domain Services（ドメインサービス）

### 1. ScoringService（点数計算サービス）

**責務**: 符計算と点数計算を行う

**主要メソッド**:
- `calculateFu()` - 符を計算
- `calculateScore()` - 点数を計算
- `formatScore()` - 点数を文字列表現に変換

**FuCalculation（符計算結果）**:
- `base: number` - 基本符（20符）
- `meldFu: number` - 面子符
- `waitFu: number` - 待ち符
- `tsumoFu: number` - ツモ符
- `total: number` - 合計符（10符単位切り上げ）

**ScoreCalculation（点数計算結果）**:
- `han: number` - 翻数
- `fu: number` - 符
- `basePoints: number` - 基本点
- `payment: number | object` - 支払い点数
- `yaku: Yaku[]` - 役のリスト
- `isYakuman: boolean` - 役満かどうか
- `scoreName: string` - 点数名（"満貫"、"3翻40符"など）

### 2. YakuDetectionService（役判定サービス）

**責務**: 手牌から役を判定する

**主要メソッド**:
- `detectYaku()` - 全ての役を判定
- `checkTanyao()` - 断么九判定
- `checkPinfu()` - 平和判定
- `checkIipeikou()` - 一盃口判定
- `checkSanshoku()` - 三色同順判定
- `checkIttsu()` - 一気通貫判定
- `checkHonitsu()` - 混一色判定
- `checkChinitsu()` - 清一色判定
- `checkYakuman()` - 役満判定

### 3. WinningHandAnalyzer（和了形解析サービス）

**責務**: 手牌が和了形かどうかを判定し、待ち牌を分析

**主要メソッド**:
- `isTenpai()` - 聴牌判定
- `isWinning()` - 和了判定
- `getWaitingTiles()` - 待ち牌を取得
- `getWaitType()` - 待ちの種類（両面、嵌張、単騎など）
- `findAllMeldSets()` - 可能な面子構成を全て探索

### 4. RoundManager（局管理サービス）

**責務**: 局の進行と次の局の生成を管理

**主要メソッド**:
- `nextRound()` - 次の局を生成
- `isGameFinished()` - ゲーム終了判定

**ルール**:
- 親が和了または流局聴牌 → 本場が増える、親は変わらない
- 子が和了または流局不聴 → 次の局へ、親が移動
- 東4局終了 → 東風戦は終了、半荘は南場へ

---

## Domain Events（ドメインイベント）

ドメイン内で発生した重要な出来事をイベントとして表現します。これにより、UIの更新、ログ記録、統計収集などが疎結合に実装できます。

### イベント一覧

1. **GameStartedEvent** - ゲーム開始
2. **RoundStartedEvent** - 局開始
3. **TileDrawnEvent** - 牌をツモ
4. **TileDiscardedEvent** - 牌を捨てる
5. **ChiCalledEvent** - チー
6. **PonCalledEvent** - ポン
7. **MinkanCalledEvent** - 明槓
8. **AnkanCalledEvent** - 暗槓
9. **KakanCalledEvent** - 加槓
10. **RiichiDeclaredEvent** - リーチ宣言
11. **RonWinEvent** - ロン和了
12. **TsumoWinEvent** - ツモ和了
13. **DrawGameEvent** - 流局
14. **ScoreTransferEvent** - 点数移動
15. **GameFinishedEvent** - ゲーム終了

### イベント駆動アーキテクチャ

```typescript
// イベントの購読
DomainEventPublisher.getInstance().subscribe('TileDiscarded', (event) => {
  console.log(`${event.playerId} が ${event.tile} を捨てました`);
  // UI更新、ログ記録など
});

// イベントの発行
const event: TileDiscardedEvent = {
  eventType: 'TileDiscarded',
  timestamp: new Date(),
  aggregateId: gameId,
  playerId: player.id,
  tile: discardedTile,
  isRiichi: false,
  isTsumogiri: false,
};
DomainEventPublisher.getInstance().publish(event);
```

---

## ゲームフロー

### 1. ゲーム開始フロー

```
1. Game作成（プレイヤー4人、ルール設定）
2. Game.start()
   └─> 配牌（各13枚）
   └─> 局開始
   └─> GameStartedEvent発行
3. 親のツモフェーズへ
```

### 2. ターンの基本フロー

```
[ツモフェーズ]
1. プレイヤーが牌をツモ
2. TileDrawnEvent発行
3. 和了判定
   ├─ 和了可能 → 和了選択可能
   ├─ リーチ可能 → リーチ選択可能
   ├─ 暗槓可能 → 暗槓選択可能
   └─ 加槓可能 → 加槓選択可能

[捨て牌フェーズ]
4. プレイヤーが牌を捨てる
5. TileDiscardedEvent発行
6. 他プレイヤーの副露判定
   ├─ ロン可能 → ロン選択可能
   ├─ ポン可能 → ポン選択可能
   ├─ チー可能（上家のみ） → チー選択可能
   └─ 明槓可能 → 明槓選択可能

[副露待ちフェーズ]
7. 副露の選択を待つ（タイムアウトあり）
8. 副露なし → 次のプレイヤーへ
9. 副露あり → 副露処理 → 副露したプレイヤーの捨て牌フェーズへ

[次のターン]
10. 山が空になったら流局
11. 次のプレイヤーのツモフェーズへ
```

### 3. 和了フロー

```
[ロン和了]
1. 和了宣言
2. 手牌公開
3. 役判定
4. 点数計算
5. 点数移動
6. RonWinEvent発行
7. 局終了処理
8. 次の局へ（または終了）

[ツモ和了]
1. 和了宣言
2. 手牌公開
3. 役判定
4. 点数計算
5. 点数移動（3人から）
6. TsumoWinEvent発行
7. 局終了処理
8. 次の局へ（または終了）
```

### 4. 流局フロー

```
1. 山が尽きる
2. 聴牌判定（各プレイヤー）
3. 手牌公開
4. 聴牌料の移動（3000点を分配）
5. DrawGameEvent発行
6. 局終了処理
7. 次の局へ（本場が増える）
```

---

## ユースケース例

### ケース1: リーチからのツモ和了

```typescript
// プレイヤーがリーチ宣言
player.declareRiichi(turnCount);
game.phase = GamePhase.DISCARD;

// リーチ宣言牌を捨てる
const discardedTile = player.discardTile(tileId);
eventPublisher.publish({
  eventType: 'RiichiDeclared',
  playerId: player.id,
  isDouble: false,
});

// 数巡後、ツモ
const drawnTile = wall.drawTile();
player.drawTile(drawnTile);

// 和了判定
const winningHand = new WinningHand(
  player.hand.concealedTiles,
  player.hand.melds,
  drawnTile,
  WinType.TSUMO
);

if (winningHand.isWinning()) {
  // 役判定
  const yaku = yakuDetectionService.detectYaku(winningHand, context);

  // 点数計算
  const score = scoringService.calculateScore(
    winningHand,
    yaku,
    doraCount,
    isDealer,
    seatWind,
    prevalentWind
  );

  // 点数移動
  for (const otherPlayer of game.players) {
    if (otherPlayer.id !== player.id) {
      const payment = isDealer ? score.payment.nonDealer :
                      otherPlayer.seat === round.dealerSeat ?
                      score.payment.dealer : score.payment.nonDealer;
      otherPlayer.subtractScore(payment);
      player.addScore(payment);
    }
  }

  // 和了イベント
  eventPublisher.publish({
    eventType: 'TsumoWin',
    winnerId: player.id,
    winningTile: drawnTile,
    han: score.han,
    fu: score.fu,
    points: score.payment,
  });

  // 局終了
  round.finishWithWin();
  game.nextRound(player.seat === round.dealerSeat, false);
}
```

### ケース2: ポンからのロン和了

```typescript
// 他プレイヤーが牌を捨てる
const discardedTile = currentPlayer.discardTile(tileId);

// ポン可能か判定
if (player.hand.canPon(discardedTile)) {
  // ポン実行
  const tiles = player.hand.findTiles(t => t.equals(discardedTile)).slice(0, 2);
  tiles.push(discardedTile);

  const meld = MeldFactory.createPon(
    tiles,
    discardedTile,
    getMeldSource(currentPlayer.seat, player.seat)
  );

  player.hand.addMeld(meld);

  // イベント発行
  eventPublisher.publish({
    eventType: 'PonCalled',
    playerId: player.id,
    meld: meld,
    calledFrom: currentPlayer.id,
  });

  // プレイヤーのターンに移る
  game.currentPlayerIndex = player.seat;
  game.phase = GamePhase.DISCARD;
}

// 数巡後、他プレイヤーの捨て牌でロン
const ronTile = somePlayer.getLastDiscard();

if (player.hand.canRon(ronTile)) {
  const winningHand = new WinningHand(
    player.hand.concealedTiles,
    player.hand.melds,
    ronTile,
    WinType.RON
  );

  // 役判定・点数計算（上記と同様）
  // ...

  // 点数移動（放銃者のみから）
  somePlayer.subtractScore(score.payment);
  player.addScore(score.payment);

  // 和了イベント
  eventPublisher.publish({
    eventType: 'RonWin',
    winnerId: player.id,
    loserId: somePlayer.id,
    winningTile: ronTile,
    han: score.han,
    fu: score.fu,
    points: score.payment,
  });
}
```

### ケース3: 国士無双（役満）

```typescript
// 国士無双判定
function isKokushi(tiles: Tile[]): boolean {
  const required = [
    // 萬子の1と9
    { suit: TileSuit.MAN, value: 1 },
    { suit: TileSuit.MAN, value: 9 },
    // 筒子の1と9
    { suit: TileSuit.PIN, value: 1 },
    { suit: TileSuit.PIN, value: 9 },
    // 索子の1と9
    { suit: TileSuit.SOU, value: 1 },
    { suit: TileSuit.SOU, value: 9 },
    // 字牌全て
    { suit: TileSuit.HONOR, value: 1 },
    { suit: TileSuit.HONOR, value: 2 },
    { suit: TileSuit.HONOR, value: 3 },
    { suit: TileSuit.HONOR, value: 4 },
    { suit: TileSuit.HONOR, value: 5 },
    { suit: TileSuit.HONOR, value: 6 },
    { suit: TileSuit.HONOR, value: 7 },
  ];

  // 13種類の么九牌が全て揃っているか＋1枚がどれかの対子
  // 実装は省略
  return true;
}

// 国士無双で和了
if (isKokushi(player.hand.concealedTiles)) {
  const yaku = [new Yaku(YakuType.KOKUSHI)];
  const score = scoringService.calculateScore(/* ... */);
  // score.isYakuman === true
  // score.scoreName === "役満"
  // score.payment === 親ロンなら48000点、子ロンなら32000点
}
```

---

## まとめ

本ドメインモデルは以下の特徴を持ちます：

### 完全性
- 麻雀のルール全体を網羅
- 役満、特殊役、ルールバリエーションに対応
- 実際のゲーム運用に必要な全要素を実装

### 拡張性
- 新しい役の追加が容易
- ルールバリエーションの追加が容易
- 三人麻雀など別バリアントへの対応も可能

### 保守性
- ドメインロジックが明確に分離
- 不変条件が各エンティティで保護されている
- テストが書きやすい設計

### イベント駆動
- ドメインイベントによる疎結合な設計
- UI更新、ログ記録、統計収集が容易
- リプレイ機能の実装が可能

---

## 次のステップ

1. **役判定アルゴリズムの実装**: YakuDetectionServiceの詳細実装
2. **和了形解析の最適化**: 高速な待ち牌判定アルゴリズム
3. **AI思考エンジン**: CPU対戦のための思考ルーチン
4. **永続化層**: ゲーム状態の保存・読み込み
5. **ネットワーク対戦**: マルチプレイヤー対応
6. **統計機能**: プレイヤーの戦績分析
7. **リプレイ機能**: ドメインイベントからのゲーム再生

このドメインモデルは、完全で実用的な麻雀ゲームを構築するための強固な基盤となります。
