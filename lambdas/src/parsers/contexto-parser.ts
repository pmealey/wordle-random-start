import { DailyResult } from '../models/daily-result';
import { ResultParser, getGroup, hasGroup } from './base/result-parser';

export class ContextoParser extends ResultParser {
  readonly countWinner = true;
  readonly gameName = 'Contexto';
  readonly golfScoring = true;
  readonly helpText = null;
  readonly url = 'https://contexto.me/';
  
  private static readonly COMPLETED_GROUP = 'completed';
  private static readonly SCORE_GROUP = 'score';
  private static readonly HINT_GROUP = 'hint';
  
  // Matches "I played contexto.me #822 and got it in 11 guesses" or with hints
  protected readonly parser = new RegExp(
    `^I played contexto\\.me #\\d+ (?<${ContextoParser.COMPLETED_GROUP}>[^\\d]+)(?<${ContextoParser.SCORE_GROUP}>\\d+) guesses( and (?<${ContextoParser.HINT_GROUP}>\\d+) hints)?`
  );
  
  protected getCleanResult(result: string, match: RegExpMatchArray): string {
    return result.trim();
  }
  
  getScoreValue(dailyResult: DailyResult): string | null {
    if (!dailyResult.scores) return null;
    
    if (dailyResult.scores.length === 1) {
      return dailyResult.scores[0].toString();
    }
    
    return '"' + dailyResult.scores.join(',') + '"';
  }
  
  protected setScore(dailyResult: DailyResult, match: RegExpMatchArray): DailyResult {
    const completedStr = getGroup(match, ContextoParser.COMPLETED_GROUP);
    const scoreStr = getGroup(match, ContextoParser.SCORE_GROUP);
    
    // gave up, no score
    if (!completedStr || !scoreStr || completedStr.startsWith('but I gave up in')) {
      return dailyResult;
    }
    
    const score = parseInt(scoreStr, 10);
    if (isNaN(score)) return dailyResult;
    
    const scores: number[] = [];
    const hintStr = getGroup(match, ContextoParser.HINT_GROUP);
    if (hintStr) {
      const hints = parseInt(hintStr, 10);
      if (!isNaN(hints)) {
        scores.push(hints);
      }
    }
    
    scores.push(score);
    dailyResult.scores = scores;
    
    return dailyResult;
  }
}
