import { DailyResult } from '../models/daily-result';
import { BasicScoreResultParser } from './base/basic-score-parser';
import { getGroup, hasGroup } from './base/result-parser';

export class WordleParser extends BasicScoreResultParser {
  readonly countWinner = true;
  readonly gameName = 'Wordle';
  readonly helpText = "Start with today's random word.";
  protected readonly extraContent = null;
  readonly url = 'https://www.nytimes.com/games/wordle/index.html';
  
  // Note: C# uses [\d|X] which incorrectly includes literal pipe - fixed here to [\dX]
  protected readonly parser = new RegExp(
    `${this.gameName} .+?(?<${BasicScoreResultParser.SCORE_GROUP}>[\\dX])/\\d`
  );
  
  protected setScore(dailyResult: DailyResult, match: RegExpMatchArray): DailyResult {
    if (!hasGroup(match, BasicScoreResultParser.SCORE_GROUP)) {
      return dailyResult;
    }
    
    const scoreStr = getGroup(match, BasicScoreResultParser.SCORE_GROUP);
    if (scoreStr && scoreStr !== 'X') {
      const score = parseInt(scoreStr, 10);
      if (!isNaN(score)) {
        dailyResult.score = score;
      }
    }
    
    return dailyResult;
  }
}
