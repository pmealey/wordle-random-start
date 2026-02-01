import { DailyResult } from '../models/daily-result';
import { BasicScoreResultParser } from './base/basic-score-parser';
import { getGroup, hasGroup } from './base/result-parser';

export class FramequizParser extends BasicScoreResultParser {
  readonly countWinner = true;
  readonly gameName = 'Framequiz';
  readonly helpText = null;
  readonly url = 'https://framequiz.com';
  protected readonly extraContent = ` - ${this.url}`;
  
  // Captures emoji line: "Framequiz #459 - 🟥 🟥 🟥" or "Framequiz #149 - 🟩 ⬛️ ⬛️"
  // Unicode: \uD83D\uDFE9 = 🟩, \uD83D\uDFE5 = 🟥, \u2B1B\uFE0F = ⬛️
  protected readonly parser = new RegExp(
    `${this.gameName} .+?(?<${BasicScoreResultParser.SCORE_GROUP}>[\uD83D\uDFE9\uDFE5\u2B1B\uFE0F ]{2,})`,
    's'
  );
  
  protected setScore(dailyResult: DailyResult, match: RegExpMatchArray): DailyResult {
    if (!hasGroup(match, BasicScoreResultParser.SCORE_GROUP)) {
      return dailyResult;
    }
    
    const scoreStr = getGroup(match, BasicScoreResultParser.SCORE_GROUP);
    if (!scoreStr) return dailyResult;
    
    const score = scoreStr.trim().replace(/ /g, '');
    const successIndex = score.indexOf('🟩');
    if (successIndex > -1) {
      dailyResult.score = (successIndex + '🟩'.length) / 2;
    }
    
    return dailyResult;
  }
}
