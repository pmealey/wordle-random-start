import { DailyResult } from '../models/daily-result';
import { ResultParser, getGroup, hasGroup } from './base/result-parser';

export class PimantleParser extends ResultParser {
  readonly countWinner = true;
  readonly gameName = 'Pimantle';
  readonly golfScoring = true;
  readonly helpText = null;
  readonly url = 'https://semantle.pimanrul.es/';
  
  private static readonly SCORE_GROUP = 'score';
  private static readonly HINT_GROUP = 'hint';
  
  // Match "I solved Pimantle #100 with 11 guesses and no hints" or "... and 5 hints"
  protected readonly parser = new RegExp(
    `^I solved ${this.gameName} #\\d+ with (?<${PimantleParser.SCORE_GROUP}>\\d+) guesses and ((?<${PimantleParser.HINT_GROUP}>\\d+)|no) hints`,
    'm'
  );
  
  protected getCleanResult(result: string, match: RegExpMatchArray): string {
    return result.replace(this.url, '').trim();
  }
  
  getScoreValue(dailyResult: DailyResult): string | null {
    return dailyResult.score?.toString() ?? null;
  }
  
  protected setScore(dailyResult: DailyResult, match: RegExpMatchArray): DailyResult {
    if (!hasGroup(match, PimantleParser.SCORE_GROUP)) {
      return dailyResult;
    }
    
    const scoreStr = getGroup(match, PimantleParser.SCORE_GROUP);
    if (!scoreStr) return dailyResult;
    
    const score = parseInt(scoreStr, 10);
    if (isNaN(score)) return dailyResult;
    
    const scores: number[] = [];
    
    // Add hints first if present (matching C# behavior)
    const hintStr = getGroup(match, PimantleParser.HINT_GROUP);
    if (hintStr) {
      const hints = parseInt(hintStr, 10);
      if (!isNaN(hints)) {
        scores.push(hints);
      }
    }
    
    // Add guesses count
    scores.push(score);
    
    dailyResult.scores = scores;
    
    return dailyResult;
  }
}
