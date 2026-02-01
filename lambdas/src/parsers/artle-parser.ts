import { DailyResult } from '../models/daily-result';
import { BasicScoreResultParser } from './base/basic-score-parser';
import { getGroup, hasGroup } from './base/result-parser';

export class ArtleParser extends BasicScoreResultParser {
  readonly countWinner = true;
  readonly gameName = 'Artle';
  readonly helpText = null;
  protected readonly extraContent = this.url;
  readonly url = 'https://www.nga.gov/Artle';
  
  // Captures emoji line after 🎨: "Artle #759\n🎨 🟥 🟥 🟥 🟥"
  protected readonly parser = new RegExp(
    `${this.gameName} #\\d+.*?🎨(?<${BasicScoreResultParser.SCORE_GROUP}>[^\\n]+)`,
    's'
  );
  
  protected setScore(dailyResult: DailyResult, match: RegExpMatchArray): DailyResult {
    if (!hasGroup(match, BasicScoreResultParser.SCORE_GROUP)) {
      return dailyResult;
    }
    
    const scoreStr = getGroup(match, BasicScoreResultParser.SCORE_GROUP);
    if (!scoreStr) return dailyResult;
    
    const score = scoreStr.replace(/ /g, '');
    const successIndex = score.indexOf('🟩');
    if (successIndex > -1) {
      dailyResult.score = (successIndex + '🟩'.length) / 2;
    }
    
    return dailyResult;
  }
}
