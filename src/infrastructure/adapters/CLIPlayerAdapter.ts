import {
  HumanPlayerAdapter,
  PlayerAdapterType,
} from './PlayerAdapter.js';
import { GameEvent } from '../../application/contracts/Base.js';
import {
  HandResponse,
  PossibleActionsResponse,
} from '../../application/contracts/Queries.js';

/**
 * CLIプレイヤーアダプター
 *
 * ターミナルでのインタラクション
 */
export class CLIPlayerAdapter extends HumanPlayerAdapter {
  readonly type = PlayerAdapterType.CLI;

  private pendingInput: {
    resolve: (value: string) => void;
    reject: (reason: any) => void;
  } | null = null;

  handleEvent(event: GameEvent): void {
    // ゲームイベントをコンソールに表示
    switch (event.type) {
      case 'GameStarted':
        console.log('🎮 ゲームが開始されました！');
        break;

      case 'TileDrawn':
        if (event.data.playerId === this.playerId) {
          console.log(`🀄 牌をツモりました: ${this.formatTile(event.data.tile)}`);
        } else {
          console.log(`${event.data.playerId} が牌をツモりました`);
        }
        break;

      case 'TileDiscarded':
        console.log(
          `${event.data.playerId} が ${this.formatTile(event.data.tile)} を捨てました`
        );
        break;

      case 'RiichiDeclared':
        console.log(`🔔 ${event.data.playerId} がリーチを宣言しました！`);
        break;

      case 'RonWin':
        console.log(
          `🎉 ${event.data.winnerId} がロン和了しました！ (${event.data.han}翻${event.data.fu}符)`
        );
        break;

      case 'TsumoWin':
        console.log(
          `🎊 ${event.data.winnerId} がツモ和了しました！ (${event.data.han}翻${event.data.fu}符)`
        );
        break;

      // 他のイベントも同様に処理
    }
  }

  async startTurn(): Promise<void> {
    this.state.isMyTurn = true;
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('あなたのターンです！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 手牌を表示
    await this.displayHand();

    // 可能なアクションを取得して表示
    const actions = await this.sendQuery<PossibleActionsResponse>({
      type: 'GetPossibleActions',
    });

    console.log('\n可能なアクション:');
    actions.actions.forEach((action, index) => {
      console.log(`  ${index + 1}. ${action.description}`);
    });

    // ユーザー入力を待つ
    await this.waitForUserInput(actions.actions);

    await this.endTurn();
  }

  /**
   * 手牌を表示
   */
  private async displayHand(): Promise<void> {
    const hand = await this.sendQuery<HandResponse>({
      type: 'GetHand',
    });

    console.log('手牌:');
    const tilesStr = hand.concealedTiles
      .map((t, i) => `${i + 1}.${this.formatTile(t)}`)
      .join(' ');
    console.log(`  ${tilesStr}`);

    if (hand.melds.length > 0) {
      console.log('副露:');
      hand.melds.forEach((meld, i) => {
        console.log(`  ${this.formatMeld(meld)}`);
      });
    }
  }

  /**
   * ユーザー入力を待つ
   */
  private async waitForUserInput(actions: any[]): Promise<void> {
    // この実装は簡略化されています
    // 実際にはreadlineやinkなどを使用してインタラクティブな入力を実装します
    console.log('\nアクションを選択してください (番号を入力):');

    // ダミー実装: 最初のアクションを自動選択
    const selectedAction = actions[0];

    switch (selectedAction.type) {
      case 'draw':
        await this.sendCommand({ type: 'DrawTile' });
        break;

      case 'discard':
        // 最初の牌を捨てる（ダミー）
        const hand = await this.sendQuery<HandResponse>({ type: 'GetHand' });
        if (hand.concealedTiles.length > 0) {
          await this.sendCommand({
            type: 'DiscardTile',
            tileId: (hand.concealedTiles[0] as any).id,
          } as any);
        }
        break;

      case 'riichi':
        // リーチ実装
        break;

      // 他のアクション
    }
  }

  /**
   * 牌をフォーマット
   */
  private formatTile(tile: any): string {
    // tile.toStringに相当する処理
    if (tile.suit === 'honor') {
      const honorNames: Record<number, string> = {
        1: '東',
        2: '南',
        3: '西',
        4: '北',
        5: '白',
        6: '發',
        7: '中',
      };
      return honorNames[tile.value];
    }

    const suitChar = tile.suit === 'man' ? '萬' : tile.suit === 'pin' ? '筒' : '索';
    return `${tile.value}${suitChar}`;
  }

  /**
   * 面子をフォーマット
   */
  private formatMeld(meld: any): string {
    const tiles = meld.tiles.map((t: any) => this.formatTile(t)).join('');
    const type = meld.type === 'chi' ? 'チー' : meld.type === 'pon' ? 'ポン' : 'カン';
    return `${type}: ${tiles}`;
  }
}
