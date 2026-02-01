import { DailyResult } from '../models/daily-result';
import { ResultParser, getGroup, hasGroup } from './base/result-parser';

export class RedactleParser extends ResultParser {
  readonly countWinner = true;
  readonly gameName = 'Redactle';
  readonly golfScoring = true;
  readonly helpText = null;
  readonly url = 'https://redactle.net/';
  
  private static readonly SCORE_GROUP = 'score';
  
  // Match "I solved Redactle #769 in 38 guesses"
  protected readonly parser = new RegExp(
    `^I solved ${this.gameName} #\\d+ in (?<${RedactleParser.SCORE_GROUP}>\\d+) guesses`
  );
  
  protected getCleanResult(result: string, match: RegExpMatchArray): string {
    return result.replace(`Play at ${this.url}`, '').trim();
  }
  
  getScoreValue(dailyResult: DailyResult): string | null {
    return dailyResult.score?.toString() ?? null;
  }
  
  protected setScore(dailyResult: DailyResult, match: RegExpMatchArray): DailyResult {
    if (hasGroup(match, RedactleParser.SCORE_GROUP)) {
      const scoreStr = getGroup(match, RedactleParser.SCORE_GROUP);
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
