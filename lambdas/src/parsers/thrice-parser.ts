import { DailyResult } from '../models/daily-result';
import { BasicScoreResultParser } from './base/basic-score-parser';
import { getGroup, hasGroup } from './base/result-parser';

export class ThriceParser extends BasicScoreResultParser {
  readonly countWinner = true;
  readonly gameName = 'Thrice';
  readonly golfScoring = false;
  readonly helpText = null;
  protected readonly extraContent = this.url;
  readonly url = 'https://thricegame.com';
  
  // Matches "Thrice Game #365 → 3 points" or "Thrice Game #507 → I got a perfect score"
  protected readonly parser = new RegExp(
    `${this.gameName} Game #\\d+ → ((?<${BasicScoreResultParser.SCORE_GROUP}>[\\d]+) points|(?<perfect>I got a perfect score on today's Thrice))`
  );
  
  protected setScore(dailyResult: DailyResult, match: RegExpMatchArray): DailyResult {
    // Check for perfect score first
    if (hasGroup(match, 'perfect') && getGroup(match, 'perfect')) {
      dailyResult.score = 15;
      return dailyResult;
    }
    
    return super.setScore(dailyResult, match);
  }
}
