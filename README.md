# 麻雀ゲーム - 完全なドメインモデル

CLIで遊べる麻雀ゲームと、完全なドメイン駆動設計に基づく麻雀ドメインモデルを実装したプロジェクトです。

## 🎯 プロジェクトの目的

1. **実用的な麻雀ゲーム**: ターミナルで遊べる麻雀ゲームを提供
2. **完全なドメインモデル**: 麻雀の全ルールを網羅したドメインモデルの設計と実装
3. **学習リソース**: ドメイン駆動設計（DDD）の実践的な例として活用

## 📦 技術スタック

- **TypeScript**: 型安全な開発
- **ink**: ターミナルUI構築フレームワーク（React for CLIs）
- **React**: inkの基盤
- **Domain-Driven Design (DDD)**: ドメインモデルの設計原則

## 🏗️ プロジェクト構造

```
vibe/
├── src/
│   ├── domain/              # ドメイン層
│   │   ├── entities/        # エンティティ
│   │   │   ├── Game.ts      # ゲーム（集約ルート）
│   │   │   ├── Player.ts    # プレイヤー
│   │   │   ├── Hand.ts      # 手牌
│   │   │   ├── Round.ts     # 局
│   │   │   └── Wall.ts      # 山
│   │   ├── valueObjects/    # 値オブジェクト
│   │   │   ├── Tile.ts      # 牌
│   │   │   ├── Meld.ts      # 面子（ポン・チー・カン）
│   │   │   ├── Yaku.ts      # 役
│   │   │   ├── WinningHand.ts    # 和了形
│   │   │   └── GameRules.ts      # ゲームルール
│   │   ├── services/        # ドメインサービス
│   │   │   └── ScoringService.ts # 点数計算
│   │   └── events/          # ドメインイベント
│   │       └── DomainEvents.ts
│   ├── App.tsx              # UIコンポーネント（ink）
│   ├── index.tsx            # エントリーポイント
│   ├── types.ts             # シンプルな型定義
│   └── gameLogic.ts         # シンプルなゲームロジック
├── docs/
│   ├── DOMAIN_MODEL.md      # ドメインモデル設計書
│   └── ARCHITECTURE.md      # アーキテクチャ設計書
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 セットアップ

```bash
# 依存関係のインストール
npm install

# 開発モードで実行（シンプルな麻雀ゲーム）
npm run dev

# ビルド
npm run build

# ビルド後に実行
npm start
```

## 🎮 遊び方

ゲームを起動すると、4人麻雀が始まります。

### 操作方法

- **スペースキー**: 牌を引く
- **← →**: 捨てる牌を選択
- **Enter**: 選択した牌を捨てる
- **Q**: ゲームを終了

### ゲームの流れ

1. ゲーム開始時に自動で配牌（各13枚）
2. あなたのターンになったら、スペースキーで牌を引く
3. 矢印キーで捨てる牌を選択し、Enterで捨てる
4. CPU（3名）が自動でプレイ
5. 山が尽きるまで続く

## 📚 ドメインモデル

本プロジェクトでは、麻雀の完全なドメインモデルをドメイン駆動設計（DDD）に基づいて設計・実装しています。

### 主要コンポーネント

#### 1. Value Objects（値オブジェクト）

- **Tile（牌）**: 不変の牌オブジェクト。萬子、筒子、索子、字牌を表現
- **Meld（面子）**: ポン、チー、カンを表現
- **Yaku（役）**: 麻雀の全役を定義（1翻役〜役満）
- **WinningHand（和了形）**: 和了した手牌の構造
- **GameRules（ゲームルール）**: ルールバリエーション設定

#### 2. Entities（エンティティ）

- **Game（ゲーム）**: 集約ルート。ゲーム全体を管理
- **Player（プレイヤー）**: プレイヤーの状態（手牌、点数、捨て牌など）
- **Hand（手牌）**: 門前の牌と副露を管理
- **Round（局）**: 局の情報（東1局、本場、供託など）
- **Wall（山）**: 牌山とドラ表示牌を管理

#### 3. Domain Services（ドメインサービス）

- **ScoringService**: 符計算・点数計算
- **YakuDetectionService**: 役判定
- **WinningHandAnalyzer**: 和了形解析・待ち牌判定
- **RoundManager**: 局の進行管理

#### 4. Domain Events（ドメインイベント）

ゲーム内で発生した重要な出来事をイベントとして記録：
- GameStartedEvent
- TileDrawnEvent
- TileDiscardedEvent
- RonWinEvent / TsumoWinEvent
- など15種類以上のイベント

### 実装されている機能

#### 完全実装

- ✅ 牌の定義（136枚、赤ドラ対応）
- ✅ 配牌と山の管理
- ✅ ツモ・捨て牌の基本フロー
- ✅ ポン・チー・カンの副露機能
- ✅ リーチ機能
- ✅ 和了形判定（4面子1雀頭、七対子）
- ✅ 全役の定義（1翻役〜役満）
- ✅ 符計算・点数計算
- ✅ ドラ・裏ドラ・赤ドラ
- ✅ 局の進行管理（東風戦・半荘）
- ✅ ルールバリエーション対応
- ✅ ドメインイベント

#### 部分実装・拡張予定

- 🔧 役判定アルゴリズム（実装ガイドあり）
- 🔧 待ち牌の自動判定
- 🔧 聴牌判定
- 🔧 フリテン判定
- 🔧 流局処理（九種九牌、四風連打など）
- 🔧 AI思考エンジン

## 📖 ドキュメント

詳細な設計ドキュメントを用意しています：

### [DOMAIN_MODEL.md](docs/DOMAIN_MODEL.md)

完全なドメインモデルの設計書：
- 全エンティティとValue Objectの詳細仕様
- 不変条件と制約
- ゲームフローの説明
- ユースケース例（リーチ、ポン、役満など）
- 150+ページ相当の包括的なドキュメント

### [ARCHITECTURE.md](docs/ARCHITECTURE.md)

アーキテクチャ設計書：
- レイヤードアーキテクチャ
- DDD（ドメイン駆動設計）パターン
- CQRS（Command Query Responsibility Segregation）
- ユースケース駆動設計
- リポジトリパターン
- イベントソーシング
- テスト戦略

## 🎓 学習リソースとして

本プロジェクトは以下のトピックの学習に適しています：

### ドメイン駆動設計（DDD）

- **集約（Aggregate）**: `Game`を集約ルートとした設計
- **値オブジェクト**: `Tile`, `Meld`, `Yaku`などの不変オブジェクト
- **エンティティ**: `Player`, `Hand`などのライフサイクルを持つオブジェクト
- **ドメインサービス**: 複数エンティティにまたがるロジック
- **ドメインイベント**: イベント駆動アーキテクチャ

### デザインパターン

- Repository Pattern
- Factory Pattern
- Strategy Pattern
- Observer Pattern (Domain Events)
- Command Pattern (CQRS)

### TypeScript

- 高度な型システムの活用
- Enum, Union Types, Discriminated Unions
- Readonly, Private修飾子
- Generic Types
- Type Guards

## 🔧 カスタマイズとルールバリエーション

### プリセットルール

```typescript
// 標準ルール（アリアリ）
const rules = GameRules.createStandard();

// 完全先付け（ナシナシ）
const rules = GameRules.createStrict();

// Mリーグルール
const rules = GameRules.createMLeague();

// 天鳳ルール
const rules = GameRules.createTenhou();
```

### カスタムルール

```typescript
const rules = new GameRules({
  gameType: GameType.HANCHAN,
  initialScore: 25000,
  useRedDora: true,
  openTanyao: true,     // 喰いタン
  atozuke: true,         // 後付け
  ippatsu: true,         // 一発
  uraDora: true,         // 裏ドラ
  doubleRon: true,       // ダブロン
  kazoeYakuman: true,    // 数え役満
  // ... 30以上の設定項目
});
```

## 🧪 テスト

```bash
# ユニットテスト（今後実装予定）
npm test

# テストカバレッジ
npm run test:coverage
```

## 🚀 今後の拡張予定

### フェーズ1: コアロジックの完成

- [ ] 役判定アルゴリズムの完全実装
- [ ] 待ち牌判定の最適化
- [ ] フリテン判定
- [ ] 流局処理の実装

### フェーズ2: ゲーム体験の向上

- [ ] リーチ、ポン、チー、カンのUI実装
- [ ] 和了判定と役表示
- [ ] 点数計算の表示
- [ ] リプレイ機能

### フェーズ3: AI対戦

- [ ] CPU思考エンジン（初級）
- [ ] 牌効率計算
- [ ] 押し引き判断
- [ ] 上級AI（深層学習）

### フェーズ4: マルチプレイヤー

- [ ] ネットワーク対戦
- [ ] ロビー機能
- [ ] 観戦モード
- [ ] チャット機能

### フェーズ5: データと分析

- [ ] 戦績記録
- [ ] 統計分析
- [ ] 牌譜の保存と読み込み
- [ ] データ可視化

## 🤝 コントリビューション

プルリクエストを歓迎します！以下の領域で特に貢献を募集しています：

- 役判定アルゴリズムの実装
- UI/UXの改善
- テストの追加
- ドキュメントの改善
- バグ修正

## 📝 ライセンス

MIT License

## 🙏 謝辞

- **ink**: 素晴らしいCLIフレームワーク
- **麻雀コミュニティ**: ルールの標準化と議論
- **DDD**: Eric Evansの「Domain-Driven Design」

---

## 📚 参考資料

### ドメイン駆動設計

- Eric Evans "Domain-Driven Design" (2003)
- Vaughn Vernon "Implementing Domain-Driven Design" (2013)

### 麻雀のルールと理論

- 日本プロ麻雀連盟公式ルール
- 天鳳ルール
- Mリーグルール

### アーキテクチャパターン

- Clean Architecture (Robert C. Martin)
- CQRS and Event Sourcing (Greg Young)
- Enterprise Integration Patterns

---

**Happy Mahjong Coding! 🀄**
