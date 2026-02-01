import { DailyResult } from '../models/daily-result';
import { ResultParser, getGroup, hasGroup } from './base/result-parser';

export class JuxtastatParser extends ResultParser {
  readonly countWinner = true;
  readonly gameName = 'Juxtastat';
  readonly golfScoring = false;
  readonly helpText = null;
  readonly url = 'https://juxtastat.org';
  
  // Note: C# uses [\d|X] which incorrectly includes literal pipe - fixed here to [\dX]
  protected readonly parser = new RegExp(
    `${this.gameName} \\d+ (?<score>[\\dX])/\\d`
  );
  
  protected getCleanResult(result: string, match: RegExpMatchArray): string {
    return result.trim();
  }
  
  getScoreValue(dailyResult: DailyResult): string | null {
    return dailyResult.score?.toString() ?? null;
  }
  
  protected setScore(dailyResult: DailyResult, match: RegExpMatchArray): DailyResult {
    if (hasGroup(match, 'score')) {
      const scoreStr = getGroup(match, 'score');
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
