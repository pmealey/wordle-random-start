import { DailyResult } from '../models/daily-result';
import { BasicScoreResultParser } from './base/basic-score-parser';

export class TravleParser extends BasicScoreResultParser {
  readonly countWinner = true;
  readonly gameName = 'Travle';
  readonly helpText = null;
  readonly url = 'https://travle.earth';
  protected readonly extraContent = this.url;
  
  // Matches "#travle #742 (1 away)" or "#travle #555 +0 (Perfect)" or "#travle #535 +6"
  // The regex captures optional +X score, may be empty for failures like "(1 away)"
  protected readonly parser = new RegExp(
    `#${this.gameName.toLowerCase()} #\\d+ \\+?(?<${BasicScoreResultParser.SCORE_GROUP}>\\d*)`
  );
  
  protected setScore(dailyResult: DailyResult, match: RegExpMatchArray): DailyResult {
    // First call base to set score from +X
    const newResult = super.setScore(dailyResult, match);
    
    // Check for (Perfect) in result to set score to -1
    if (dailyResult.result && dailyResult.result.includes('(Perfect)')) {
      newResult.score = -1;
    }
    
    return newResult;
  }
}
