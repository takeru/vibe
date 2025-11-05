import { WinningHand, WinType } from '../valueObjects/WinningHand.js';
import { Yaku, YakuType } from '../valueObjects/Yaku.js';
import { Tile, Wind } from '../valueObjects/Tile.js';

/**
 * 符の計算結果
 */
export interface FuCalculation {
  /** 基本符 */
  base: number;
  /** 面子符 */
  meldFu: number;
  /** 待ち符 */
  waitFu: number;
  /** 副底符 */
  baseFu: number;
  /** ツモ符 */
  tsumoFu: number;
  /** 合計符（切り上げ前） */
  rawTotal: number;
  /** 合計符（10符単位切り上げ） */
  total: number;
}

/**
 * 点数計算結果
 */
export interface ScoreCalculation {
  /** 翻数 */
  han: number;
  /** 符 */
  fu: number;
  /** 基本点 */
  basePoints: number;
  /** 支払い点数（ツモの場合は配列、ロンの場合は単一） */
  payment: number | { dealer: number; nonDealer: number };
  /** 役のリスト */
  yaku: Yaku[];
  /** 役満かどうか */
  isYakuman: boolean;
  /** 点数名（満貫、跳満など） */
  scoreName: string;
}

/**
 * 点数計算サービス
 */
export class ScoringService {
  /**
   * 符を計算
   */
  calculateFu(
    winningHand: WinningHand,
    isDealer: boolean,
    seatWind: Wind,
    prevalentWind: Wind
  ): FuCalculation {
    const { tiles, melds, winType } = winningHand;

    // 七対子は固定25符
    if (this.isChiitoitsu(tiles)) {
      return {
        base: 25,
        meldFu: 0,
        waitFu: 0,
        baseFu: 0,
        tsumoFu: 0,
        rawTotal: 25,
        total: 25,
      };
    }

    // 平和ツモは固定20符
    // TODO: 平和判定を実装

    let fu = 20; // 副底
    let meldFu = 0;
    let waitFu = 0;
    let tsumoFu = winType === WinType.TSUMO ? 2 : 0;

    // 門前ロンは10符追加
    if (winType === WinType.RON && winningHand.isConcealed()) {
      fu += 10;
    }

    // 面子符の計算
    for (const meld of melds) {
      const isTerminalOrHonor = meld.tiles[0].isTerminal();
      const isOpen = meld.isOpen;

      if (meld.isTriplet()) {
        if (isTerminalOrHonor) {
          meldFu += isOpen ? 4 : 8;
        } else {
          meldFu += isOpen ? 2 : 4;
        }
      } else if (meld.isQuad()) {
        if (isTerminalOrHonor) {
          meldFu += isOpen ? 16 : 32;
        } else {
          meldFu += isOpen ? 8 : 16;
        }
      }
    }

    // TODO: 雀頭符、待ち符の計算を実装

    const rawTotal = fu + meldFu + waitFu + tsumoFu;
    const total = Math.ceil(rawTotal / 10) * 10;

    return {
      base: 20,
      meldFu,
      waitFu,
      baseFu: fu - 20,
      tsumoFu,
      rawTotal,
      total,
    };
  }

  /**
   * 七対子判定（簡易版）
   */
  private isChiitoitsu(tiles: Tile[]): boolean {
    if (tiles.length !== 14) return false;
    const sorted = [...tiles].sort((a, b) => a.toSortKey() - b.toSortKey());

    for (let i = 0; i < sorted.length; i += 2) {
      if (!sorted[i].equals(sorted[i + 1])) {
        return false;
      }
    }
    return true;
  }

  /**
   * 点数を計算
   */
  calculateScore(
    winningHand: WinningHand,
    yaku: Yaku[],
    doraCount: number,
    isDealer: boolean,
    seatWind: Wind,
    prevalentWind: Wind
  ): ScoreCalculation {
    // 翻数の合計
    const totalHan = yaku.reduce((sum, y) => sum + y.han, 0) + doraCount;
    const isYakuman = yaku.some(y => y.isYakuman);

    // 役満の場合は符計算不要
    if (isYakuman) {
      return this.calculateYakumanScore(totalHan, isDealer, winningHand.winType, yaku);
    }

    // 符の計算
    const fuCalc = this.calculateFu(winningHand, isDealer, seatWind, prevalentWind);
    const fu = fuCalc.total;

    // 基本点の計算
    let basePoints: number;
    let scoreName: string;

    if (totalHan >= 13) {
      // 数え役満
      basePoints = 8000;
      scoreName = '数え役満';
    } else if (totalHan >= 11) {
      // 三倍満
      basePoints = 6000;
      scoreName = '三倍満';
    } else if (totalHan >= 8) {
      // 倍満
      basePoints = 4000;
      scoreName = '倍満';
    } else if (totalHan >= 6) {
      // 跳満
      basePoints = 3000;
      scoreName = '跳満';
    } else if (totalHan >= 5) {
      // 満貫
      basePoints = 2000;
      scoreName = '満貫';
    } else if (totalHan >= 4 && fu >= 40) {
      // 満貫（4翻40符以上）
      basePoints = 2000;
      scoreName = '満貫';
    } else if (totalHan >= 3 && fu >= 70) {
      // 満貫（3翻70符以上）
      basePoints = 2000;
      scoreName = '満貫';
    } else {
      // 通常計算
      basePoints = fu * Math.pow(2, 2 + totalHan);
      scoreName = `${totalHan}翻${fu}符`;
    }

    // 支払い点数の計算
    const payment = this.calculatePayment(
      basePoints,
      isDealer,
      winningHand.winType
    );

    return {
      han: totalHan,
      fu,
      basePoints,
      payment,
      yaku,
      isYakuman: false,
      scoreName,
    };
  }

  /**
   * 役満の点数計算
   */
  private calculateYakumanScore(
    yakumanCount: number,
    isDealer: boolean,
    winType: WinType,
    yaku: Yaku[]
  ): ScoreCalculation {
    const basePoints = 8000 * Math.floor(yakumanCount / 13);
    const payment = this.calculatePayment(basePoints, isDealer, winType);

    const scoreNames = ['役満', '二倍役満', '三倍役満', '四倍役満', '五倍役満', '六倍役満'];
    const multiplier = Math.floor(yakumanCount / 13);
    const scoreName = scoreNames[Math.min(multiplier - 1, scoreNames.length - 1)];

    return {
      han: yakumanCount,
      fu: 0,
      basePoints,
      payment,
      yaku,
      isYakuman: true,
      scoreName,
    };
  }

  /**
   * 支払い点数の計算
   */
  private calculatePayment(
    basePoints: number,
    isDealer: boolean,
    winType: WinType
  ): number | { dealer: number; nonDealer: number } {
    if (winType === WinType.TSUMO) {
      // ツモの場合
      if (isDealer) {
        // 親ツモ: 全員から2倍ずつ
        const payment = Math.ceil((basePoints * 2) / 100) * 100;
        return { dealer: 0, nonDealer: payment };
      } else {
        // 子ツモ: 親から2倍、子から1倍
        const dealerPayment = Math.ceil((basePoints * 2) / 100) * 100;
        const nonDealerPayment = Math.ceil(basePoints / 100) * 100;
        return { dealer: dealerPayment, nonDealer: nonDealerPayment };
      }
    } else {
      // ロンの場合
      if (isDealer) {
        // 親ロン: 6倍
        return Math.ceil((basePoints * 6) / 100) * 100;
      } else {
        // 子ロン: 4倍
        return Math.ceil((basePoints * 4) / 100) * 100;
      }
    }
  }

  /**
   * 点数を文字列で表現
   */
  formatScore(score: ScoreCalculation): string {
    const { scoreName, payment } = score;

    if (typeof payment === 'number') {
      return `${scoreName} ${payment}点`;
    } else {
      return `${scoreName} 親:${payment.dealer}点 子:${payment.nonDealer}点`;
    }
  }
}
