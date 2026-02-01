import { DailyResult } from '../models/daily-result';
import { ResultParser, getGroup, hasGroup } from './base/result-parser';

export class FoodGuessrParser extends ResultParser {
  readonly countWinner = true;
  readonly gameName = 'FoodGuessr';
  readonly golfScoring = false;
  readonly helpText = null;
  readonly url = 'https://foodguessr.com';
  
  // Matches "FoodGuessr - 04 Nov 2024 GMT...Total score: 9,000 / 15,000"
  // Note: C# uses [\d|,|.] which incorrectly includes literal pipes - fixed here to [\d,.]
  protected readonly parser = new RegExp(
    `${this.gameName} .+?Total score: (?<score>[\\d,\\.]+)`,
    's'
  );
  
  protected getCleanResult(result: string, match: RegExpMatchArray): string {
    // C# only looks for "Can you beat my score? New game daily!" - NOT "Can you match"
    const index = result.indexOf('Can you beat my score? New game daily!');
    if (index > -1) {
      return result.substring(0, index).trim();
    }
    return result;
  }
  
  getScoreValue(dailyResult: DailyResult): string | null {
    return dailyResult.score?.toString() ?? null;
  }
  
  protected setScore(dailyResult: DailyResult, match: RegExpMatchArray): DailyResult {
    if (hasGroup(match, 'score')) {
      const scoreStr = getGroup(match, 'score')?.replace(/,/g, '').replace(/\./g, '');
      if (scoreStr) {
        const score = parseInt(scoreStr, 10);
        if (!isNaN(score)) {
          dailyResult.score = score;
        }
      }
    }
    return dailyResult;
  }
}
