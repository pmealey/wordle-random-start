import { DailyResult } from '../models/daily-result';
import { BasicScoreResultParser } from './base/basic-score-parser';

export class DungleonParser extends BasicScoreResultParser {
  readonly countWinner = true;
  readonly gameName = 'Dungleon';
  readonly helpText = null;
  protected readonly extraContent = null;
  readonly url = 'https://www.dungleon.com';
  
  // Matches "https://www.dungleon.com #850 X/6" (share format) or "Dungleon #850 X/6" (cleaned format)
  // C# uses: `{Url} #\d+ (?<score>[\d|X])/\d` - only matches URL format
  // Note: C# uses [\d|X] which incorrectly includes literal pipe - fixed here to [\dX]
  protected readonly parser = new RegExp(
    `(?:${this.url}|${this.gameName}) #\\d+ (?<${BasicScoreResultParser.SCORE_GROUP}>[\\dX])/\\d`
  );
  
  protected getCleanResult(result: string, match: RegExpMatchArray): string {
    return result.replace(this.url, this.gameName).trim();
  }
}
