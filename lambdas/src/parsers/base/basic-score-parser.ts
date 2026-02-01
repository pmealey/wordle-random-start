import { DailyResult } from '../../models/daily-result';
import { ResultParser, getGroup, hasGroup } from './result-parser';

/**
 * Base class for parsers that extract a simple numeric score
 * Ported from backend/Services/BasicScoreResultParser.cs
 */
export abstract class BasicScoreResultParser extends ResultParser {
  readonly golfScoring: boolean = true;
  
  protected static readonly SCORE_GROUP = 'score';
  
  /** Extra content to remove from the result */
  protected abstract readonly extraContent: string | null;
  
  protected getCleanResult(result: string, match: RegExpMatchArray): string {
    if (!this.extraContent) {
      return result.trim();
    }
    return result.replace(this.extraContent, '').trim();
  }
  
  getScoreValue(dailyResult: DailyResult): string | null {
    return dailyResult.score?.toString() ?? null;
  }
  
  protected setScore(dailyResult: DailyResult, match: RegExpMatchArray): DailyResult {
    if (!hasGroup(match, BasicScoreResultParser.SCORE_GROUP)) {
      return dailyResult;
    }
    
    const scoreStr = getGroup(match, BasicScoreResultParser.SCORE_GROUP);
    if (scoreStr) {
      const score = parseInt(scoreStr, 10);
      if (!isNaN(score)) {
        dailyResult.score = score;
      }
    }
    
    return dailyResult;
  }
}
