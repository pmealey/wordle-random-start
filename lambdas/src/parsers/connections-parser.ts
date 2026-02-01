import { DailyResult } from '../models/daily-result';
import { BasicScoreResultParser } from './base/basic-score-parser';
import { getGroup, hasGroup } from './base/result-parser';

export class ConnectionsParser extends BasicScoreResultParser {
  readonly countWinner = true;
  readonly gameName = 'Connections';
  readonly helpText = null;
  protected readonly extraContent = null;
  readonly url = 'https://www.nytimes.com/games/connections';
  
  protected readonly parser = new RegExp(
    `^${this.gameName}\\s*Puzzle #\\d+(?<${BasicScoreResultParser.SCORE_GROUP}>.*)$`,
    's'
  );
  
  protected getCleanResult(result: string, match: RegExpMatchArray): string {
    return result;
  }
  
  protected setScore(dailyResult: DailyResult, match: RegExpMatchArray): DailyResult {
    if (!hasGroup(match, BasicScoreResultParser.SCORE_GROUP)) {
      return dailyResult;
    }
    
    const scoreContent = getGroup(match, BasicScoreResultParser.SCORE_GROUP) || '';
    const scoreRows = scoreContent
      .split('\n')
      .filter(row => row.trim().length > 0)
      .map(row => row.trim());
    
    const totalGuesses = scoreRows.length;
    
    // Count correct rows (all same emoji)
    const correctRows = scoreRows.filter(row => {
      const parts: string[] = [];
      for (let i = 0; i < row.length - 1; i += 2) {
        parts.push(row.substring(i, i + 2));
      }
      const uniqueParts = [...new Set(parts)];
      return uniqueParts.length === 1;
    }).length;
    
    // Score is total guesses plus missed categories
    dailyResult.score = totalGuesses + (4 - correctRows);
    
    return dailyResult;
  }
}
