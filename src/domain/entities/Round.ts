import { Wind } from '../valueObjects/Tile.js';

/**
 * 局の種類
 */
export enum RoundType {
  /** 東場 */
  EAST = 'east',
  /** 南場 */
  SOUTH = 'south',
  /** 西場 */
  WEST = 'west',
  /** 北場 */
  NORTH = 'north',
}

/**
 * 局の状態
 */
export enum RoundStatus {
  /** 開始前 */
  NOT_STARTED = 'not_started',
  /** プレイ中 */
  IN_PROGRESS = 'in_progress',
  /** 和了 */
  WON = 'won',
  /** 流局 */
  DRAWN = 'drawn',
  /** 終了 */
  FINISHED = 'finished',
}

/**
 * 流局の種類
 */
export enum DrawType {
  /** 通常の流局（牌がなくなった） */
  EXHAUSTIVE = 'exhaustive',
  /** 九種九牌 */
  NINE_TERMINALS = 'nine_terminals',
  /** 四風連打 */
  FOUR_WINDS = 'four_winds',
  /** 四槓散了 */
  FOUR_KANS = 'four_kans',
  /** 四家立直 */
  FOUR_RIICHI = 'four_riichi',
  /** 三家和 */
  TRIPLE_RON = 'triple_ron',
}

/**
 * 局のエンティティ
 */
export class Round {
  private _roundType: RoundType;
  private _roundNumber: number; // 1-4（東1局、東2局など）
  private _dealerSeat: number; // 親の席（0-3）
  private _honbaCount: number; // 本場
  private _riichiSticks: number; // 供託
  private _status: RoundStatus;
  private _turnCount: number;

  constructor(
    roundType: RoundType,
    roundNumber: number,
    dealerSeat: number,
    honbaCount: number = 0,
    riichiSticks: number = 0
  ) {
    if (roundNumber < 1 || roundNumber > 4) {
      throw new Error('Round number must be between 1 and 4');
    }
    if (dealerSeat < 0 || dealerSeat > 3) {
      throw new Error('Dealer seat must be between 0 and 3');
    }

    this._roundType = roundType;
    this._roundNumber = roundNumber;
    this._dealerSeat = dealerSeat;
    this._honbaCount = honbaCount;
    this._riichiSticks = riichiSticks;
    this._status = RoundStatus.NOT_STARTED;
    this._turnCount = 0;
  }

  /**
   * 局を開始
   */
  start(): void {
    if (this._status !== RoundStatus.NOT_STARTED) {
      throw new Error('Round has already started');
    }
    this._status = RoundStatus.IN_PROGRESS;
  }

  /**
   * ターンを進める
   */
  incrementTurn(): void {
    this._turnCount++;
  }

  /**
   * 局を和了で終了
   */
  finishWithWin(): void {
    this._status = RoundStatus.WON;
  }

  /**
   * 局を流局で終了
   */
  finishWithDraw(drawType: DrawType): void {
    this._status = RoundStatus.DRAWN;
  }

  /**
   * 本場を増やす
   */
  incrementHonba(): void {
    this._honbaCount++;
  }

  /**
   * リーチ棒を追加
   */
  addRiichiStick(): void {
    this._riichiSticks++;
  }

  /**
   * リーチ棒をクリア
   */
  clearRiichiSticks(): void {
    this._riichiSticks = 0;
  }

  /**
   * 場風を取得
   */
  getPrevalentWind(): Wind {
    switch (this._roundType) {
      case RoundType.EAST:
        return Wind.EAST;
      case RoundType.SOUTH:
        return Wind.SOUTH;
      case RoundType.WEST:
        return Wind.WEST;
      case RoundType.NORTH:
        return Wind.NORTH;
    }
  }

  /**
   * 特定のプレイヤーの自風を取得
   */
  getSeatWind(playerSeat: number): Wind {
    const windIndex = (playerSeat - this._dealerSeat + 4) % 4;
    return [Wind.EAST, Wind.SOUTH, Wind.WEST, Wind.NORTH][windIndex];
  }

  /**
   * 局の表示名を取得（例: "東1局"）
   */
  getDisplayName(): string {
    const roundNames = {
      [RoundType.EAST]: '東',
      [RoundType.SOUTH]: '南',
      [RoundType.WEST]: '西',
      [RoundType.NORTH]: '北',
    };
    const honba = this._honbaCount > 0 ? ` ${this._honbaCount}本場` : '';
    return `${roundNames[this._roundType]}${this._roundNumber}局${honba}`;
  }

  get roundType(): RoundType {
    return this._roundType;
  }

  get roundNumber(): number {
    return this._roundNumber;
  }

  get dealerSeat(): number {
    return this._dealerSeat;
  }

  get honbaCount(): number {
    return this._honbaCount;
  }

  get riichiSticks(): number {
    return this._riichiSticks;
  }

  get status(): RoundStatus {
    return this._status;
  }

  get turnCount(): number {
    return this._turnCount;
  }

  /**
   * シリアライズ
   */
  toJSON(): object {
    return {
      roundType: this._roundType,
      roundNumber: this._roundNumber,
      dealerSeat: this._dealerSeat,
      honbaCount: this._honbaCount,
      riichiSticks: this._riichiSticks,
      status: this._status,
      turnCount: this._turnCount,
    };
  }

  /**
   * デシリアライズ
   */
  static fromJSON(json: any): Round {
    const round = new Round(
      json.roundType,
      json.roundNumber,
      json.dealerSeat,
      json.honbaCount,
      json.riichiSticks
    );
    round._status = json.status;
    round._turnCount = json.turnCount;
    return round;
  }
}

/**
 * 局の進行を管理するサービス
 */
export class RoundManager {
  /**
   * 次の局を生成
   */
  static nextRound(
    currentRound: Round,
    dealerWon: boolean,
    isDraw: boolean
  ): Round {
    let nextRoundType = currentRound.roundType;
    let nextRoundNumber = currentRound.roundNumber;
    let nextDealerSeat = currentRound.dealerSeat;
    let nextHonbaCount = currentRound.honbaCount;

    if (dealerWon || isDraw) {
      // 親が和了、または流局の場合は本場が増える
      nextHonbaCount++;
    } else {
      // 親が流れる
      nextHonbaCount = 0;
      nextRoundNumber++;

      if (nextRoundNumber > 4) {
        // 次の場へ
        nextRoundNumber = 1;
        switch (currentRound.roundType) {
          case RoundType.EAST:
            nextRoundType = RoundType.SOUTH;
            break;
          case RoundType.SOUTH:
            nextRoundType = RoundType.WEST;
            break;
          case RoundType.WEST:
            nextRoundType = RoundType.NORTH;
            break;
          case RoundType.NORTH:
            // ゲーム終了
            throw new Error('Game is finished');
        }
      }

      // 親が移動
      nextDealerSeat = (nextDealerSeat + 1) % 4;
    }

    return new Round(
      nextRoundType,
      nextRoundNumber,
      nextDealerSeat,
      nextHonbaCount,
      currentRound.riichiSticks
    );
  }

  /**
   * ゲームが終了しているか判定
   */
  static isGameFinished(round: Round, gameType: string): boolean {
    if (gameType === 'tonpuu') {
      // 東風戦: 東4局終了で終わり
      return round.roundType === RoundType.EAST && round.roundNumber === 4;
    } else if (gameType === 'hanchan') {
      // 半荘: 南4局終了で終わり
      return round.roundType === RoundType.SOUTH && round.roundNumber === 4;
    } else {
      // 一荘など: 適宜拡張
      return false;
    }
  }
}
