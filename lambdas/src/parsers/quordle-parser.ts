import { DailyResult } from '../models/daily-result';
import { ResultParser, getGroup, hasGroup } from './base/result-parser';

export class QuordleParser extends ResultParser {
  readonly countWinner = true;
  readonly gameName = 'Quordle';
  readonly golfScoring = true;
  readonly helpText = null;
  readonly url = 'https://www.merriam-webster.com/games/quordle/';
  
  private readonly scoreGroups = ['score1', 'score2', 'score3', 'score4'];
  
  // Note: C# uses [\d|🟥] which incorrectly includes literal pipe - fixed here to [\d🟥]
  protected readonly parser = new RegExp(
    `Daily ${this.gameName}[^\\d]+\\d+.*?[\\s\\n\\r]+` +
    this.scoreGroups.map(g => `(?<${g}>[\\d🟥])`).join('[^\\d]*')
  );
  
  protected getCleanResult(result: string, match: RegExpMatchArray): string {
    return result.replace('m-w.com/games/quordle/', '').trim();
  }
  
  getScoreValue(dailyResult: DailyResult): string | null {
    if (!dailyResult.scores) return null;
    
    const values = [0, 1, 2, 3].map(i => {
      if (dailyResult.scores && dailyResult.scores.length > i) {
        return dailyResult.scores[i].toString();
      }
      return 'X';
    });
    
    return `"${values.join(',')}"`;
  }
  
  protected setScore(dailyResult: DailyResult, match: RegExpMatchArray): DailyResult {
    const scores: number[] = [];
    
    for (const group of this.scoreGroups) {
      if (hasGroup(match, group)) {
        const value = getGroup(match, group);
        if (value) {
          const score = parseInt(value, 10);
          if (!isNaN(score)) {
            scores.push(score);
          }
        }
      }
    }
    
    if (scores.length > 0) {
      dailyResult.scores = scores;
    }
    
    return dailyResult;
  }
}
