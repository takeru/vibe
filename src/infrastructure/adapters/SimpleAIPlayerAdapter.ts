import { AIPlayerAdapter } from './PlayerAdapter.js';
import {
  HandResponse,
  PossibleActionsResponse,
} from '../../application/contracts/Queries.js';

/**
 * シンプルAIプレイヤーアダプター
 *
 * 基本的なAI思考ロジックを実装
 * - ツモ → ランダムに捨てる
 * - ポン・チーは基本的にしない
 * - リーチもしない
 */
export class SimpleAIPlayerAdapter extends AIPlayerAdapter {
  protected async think(): Promise<void> {
    // 少し待機（人間らしく）
    await this.delay(500);

    // 可能なアクションを取得
    const actionsResult = await this.sendQuery<PossibleActionsResponse>({
      type: 'GetPossibleActions',
    });

    const actions = actionsResult.actions;

    // ツモアクションがあれば実行
    const drawAction = actions.find(a => a.type === 'draw');
    if (drawAction) {
      await this.sendCommand({ type: 'DrawTile' });
      // ツモ後、再度アクションを取得
      const newActions = await this.sendQuery<PossibleActionsResponse>({
        type: 'GetPossibleActions',
      });
      await this.decideDiscard(newActions.actions);
      return;
    }

    // 捨て牌アクションがあれば実行
    const discardAction = actions.find(a => a.type === 'discard');
    if (discardAction) {
      await this.decideDiscard(actions);
      return;
    }

    // それ以外はパス
    await this.sendCommand({ type: 'PassCall' });
  }

  /**
   * 捨て牌を決定
   */
  private async decideDiscard(actions: any[]): Promise<void> {
    const hand = await this.sendQuery<HandResponse>({ type: 'GetHand' });

    if (hand.concealedTiles.length === 0) {
      return;
    }

    // シンプルな戦略: ランダムに捨てる
    const randomIndex = Math.floor(Math.random() * hand.concealedTiles.length);
    const tileToDiscard = hand.concealedTiles[randomIndex] as any;

    await this.sendCommand({
      type: 'DiscardTile',
      tileId: tileToDiscard.id,
    } as any);
  }

  /**
   * 待機（ヘルパー）
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 中級AIプレイヤーアダプター
 *
 * より高度な思考ロジック（今後実装）
 * - 安全牌を優先的に捨てる
 * - 有効なポン・チーを判断
 * - リーチ判断
 */
export class IntermediateAIPlayerAdapter extends AIPlayerAdapter {
  protected async think(): Promise<void> {
    // TODO: 実装
    // - 牌効率計算
    // - 危険牌判定
    // - 鳴き判断
    await this.delay(1000);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 上級AIプレイヤーアダプター
 *
 * 最高レベルの思考ロジック（今後実装）
 * - 深層学習モデルの使用
 * - 押し引き判断
 * - 読み合い
 */
export class AdvancedAIPlayerAdapter extends AIPlayerAdapter {
  protected async think(): Promise<void> {
    // TODO: 実装
    // - 機械学習モデルによる判断
    // - モンテカルロ木探索
    // - 相手の捨て牌からの推測
    await this.delay(1500);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
