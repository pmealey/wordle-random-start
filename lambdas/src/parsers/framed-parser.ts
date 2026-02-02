import { DailyResult } from '../models/daily-result';
import { BasicScoreResultParser } from './base/basic-score-parser';
import { getGroup, hasGroup } from './base/result-parser';

export class FramedParser extends BasicScoreResultParser {
  readonly countWinner = true;
  readonly gameName = 'Framed';
  readonly helpText = null;
  readonly url = 'https://framed.wtf';
  protected readonly extraContent = this.url;
  
  // Captures emoji line after 🎥: "Framed #1064\n🎥 🟥 🟥 🟥 🟥 🟥 🟩"
  protected readonly parser = new RegExp(
    `${this.gameName} #\\d+\\n🎥(?<${BasicScoreResultParser.SCORE_GROUP}>[^\\n]*)`,
    's'
  );
  
  protected setScore(dailyResult: DailyResult, match: RegExpMatchArray): DailyResult {
    if (!hasGroup(match, BasicScoreResultParser.SCORE_GROUP)) {
      return dailyResult;
    }
    
    const scoreStr = getGroup(match, BasicScoreResultParser.SCORE_GROUP);
    if (!scoreStr) return dailyResult;
    
    // Remove spaces from the emoji line
    const score = scoreStr.trim().replace(/ /g, '');
    
    // Find position of 🟩 (success)
    const successIndex = score.indexOf('🟩');
    if (successIndex > -1) {
      // Each emoji is 2 chars, so divide by 2 to get position (1-6)
      dailyResult.score = (successIndex + '🟩'.length) / 2;
    }
    
    return dailyResult;
  }
}
