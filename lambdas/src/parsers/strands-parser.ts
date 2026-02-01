import { DailyResult } from '../models/daily-result';
import { BasicScoreResultParser } from './base/basic-score-parser';
import { getGroup, hasGroup } from './base/result-parser';

export class StrandsParser extends BasicScoreResultParser {
  readonly countWinner = true;
  readonly gameName = 'Strands';
  readonly helpText = null;
  protected readonly extraContent = null;
  readonly url = 'https://www.nytimes.com/games/strands';
  
  // 💡 = \uD83D\uDCA1, 🔵 = \uD83D\uDD35, 🟡 = \uD83D\uDFE1
  protected readonly parser = new RegExp(
    `${this.gameName} .+?(?<${BasicScoreResultParser.SCORE_GROUP}>[\uD83D\uDCA1\uDD35\uDFE1\\n]{2,})`,
    's'
  );
  
  protected setScore(dailyResult: DailyResult, match: RegExpMatchArray): DailyResult {
    if (!hasGroup(match, BasicScoreResultParser.SCORE_GROUP)) {
      return dailyResult;
    }
    
    const content = getGroup(match, BasicScoreResultParser.SCORE_GROUP) || '';
    const cleaned = content.trim().replace(/\n/g, '');
    
    // Count hint usage (💡)
    dailyResult.score = cleaned.split('💡').length - 1;
    
    return dailyResult;
  }
}
