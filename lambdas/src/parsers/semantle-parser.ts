import { DailyResult } from '../models/daily-result';
import { ResultParser, getGroup, hasGroup } from './base/result-parser';

export class SemantleParser extends ResultParser {
  readonly countWinner = true;
  readonly gameName: string = 'Semantle';
  readonly golfScoring = true;
  readonly helpText = null;
  readonly url: string = 'https://semantle.com';
  
  private static readonly SCORE_GROUP = 'score';
  private static readonly COMPLETED_GROUP = 'completed';
  private static readonly HINTS_GROUP = 'hints';
  
  // Match new format: "Semantle #1386\n✅ 38 Guesses\n...\n💡 4 Hints"
  protected readonly parser = new RegExp(
    `${this.gameName} #\\d+.*?(?<${SemantleParser.COMPLETED_GROUP}>✅|❌).*?(?<${SemantleParser.SCORE_GROUP}>\\d+) Guesse?s?.*?💡 (?<${SemantleParser.HINTS_GROUP}>\\d+) Hints?`,
    's'
  );
  
  protected getCleanResult(result: string, match: RegExpMatchArray): string {
    return result
      .replace(this.url, '')
      .replace(this.url.replace('https://', ''), '')
      .trim();
  }
  
  getScoreValue(dailyResult: DailyResult): string | null {
    return dailyResult.score?.toString() ?? null;
  }
  
  protected setScore(dailyResult: DailyResult, match: RegExpMatchArray): DailyResult {
    // Gave up, no score
    if (getGroup(match, SemantleParser.COMPLETED_GROUP) === '❌') {
      return dailyResult;
    }
    
    let score = 0;
    
    // Hints * 10000
    if (hasGroup(match, SemantleParser.HINTS_GROUP)) {
      const hintsStr = getGroup(match, SemantleParser.HINTS_GROUP);
      if (hintsStr) {
        const hints = parseInt(hintsStr, 10);
        if (!isNaN(hints)) {
          score = hints * 10000;
        }
      }
    }
    
    // Add guesses
    if (hasGroup(match, SemantleParser.SCORE_GROUP)) {
      const scoreStr = getGroup(match, SemantleParser.SCORE_GROUP);
      if (scoreStr) {
        const guesses = parseInt(scoreStr, 10);
        if (!isNaN(guesses)) {
          score += guesses;
        }
      }
    }
    
    dailyResult.score = score;
    
    return dailyResult;
  }
}
