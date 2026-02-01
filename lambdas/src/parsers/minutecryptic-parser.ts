import { DailyResult } from '../models/daily-result';
import { BasicScoreResultParser } from './base/basic-score-parser';
import { getGroup, hasGroup } from './base/result-parser';

export class MinuteCrypticParser extends BasicScoreResultParser {
  readonly countWinner = true;
  readonly gameName = 'Minute Cryptic';
  readonly helpText = null;
  protected readonly extraContent = this.url + '/?utm_source=share';
  readonly url = 'https://www.minutecryptic.com';
  
  // Match emoji circles: ⚪️, 🟡, 🟣
  protected readonly parser = new RegExp(
    `${this.gameName}.+?(?<${BasicScoreResultParser.SCORE_GROUP}>(⚪️|🟡|🟣)+)`,
    's'
  );
  
  protected setScore(dailyResult: DailyResult, match: RegExpMatchArray): DailyResult {
    if (!hasGroup(match, BasicScoreResultParser.SCORE_GROUP)) {
      return dailyResult;
    }
    
    const emojiStr = getGroup(match, BasicScoreResultParser.SCORE_GROUP);
    if (emojiStr) {
      // Score is the position of the purple circle (🟣) divided by 2
      // Each emoji is 2 characters in the string
      const successIndex = emojiStr.indexOf('🟣');
      if (successIndex > -1) {
        dailyResult.score = successIndex / 2;
      }
    }
    
    return dailyResult;
  }
}
