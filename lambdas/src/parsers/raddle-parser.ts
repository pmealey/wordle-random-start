import { DailyResult } from '../models/daily-result';
import { BasicScoreResultParser } from './base/basic-score-parser';
import { getGroup, hasGroup } from './base/result-parser';

export class RaddleParser extends BasicScoreResultParser {
  readonly countWinner = true;
  readonly gameName = 'Raddle';
  readonly golfScoring = false;
  readonly helpText = null;
  protected readonly extraContent = null;
  readonly url = 'https://raddle.quest';
  
  // Matches "TOCO → TOUCAN [💯]\nRaddle #342..." - score is in brackets before "Raddle"
  protected readonly parser = new RegExp(
    `.+?\\[(?<${BasicScoreResultParser.SCORE_GROUP}>.+?)\\].*?${this.gameName}`,
    's'
  );
  
  protected setScore(dailyResult: DailyResult, match: RegExpMatchArray): DailyResult {
    if (!hasGroup(match, BasicScoreResultParser.SCORE_GROUP)) {
      return dailyResult;
    }
    
    let stringScore = getGroup(match, BasicScoreResultParser.SCORE_GROUP) || '';
    
    // Handle 💯 emoji as 100
    if (stringScore === '💯') {
      dailyResult.score = 100;
    }
    
    // Handle percentage suffix
    if (stringScore.endsWith('%')) {
      stringScore = stringScore.replace('%', '');
    }
    
    const score = parseInt(stringScore, 10);
    if (!isNaN(score)) {
      dailyResult.score = score;
    }
    
    return dailyResult;
  }
}
