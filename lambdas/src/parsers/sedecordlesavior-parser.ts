import { DailyResult } from '../models/daily-result';
import { BasicScoreResultParser } from './base/basic-score-parser';

export class SedecordleSaviorParser extends BasicScoreResultParser {
  readonly countWinner = true;
  readonly gameName = 'Sedecordle Savior';
  readonly helpText = null;
  protected readonly extraContent = 'https://sedecordle.com/\n#sedecordle';
  readonly url = 'https://www.sedecordle.com/savior';
  
  // Matches "Daily Savior #1368\nGuesses: X/21" or "19/21"
  // C# regex: `Daily Savior #\d+\nGuesses: (?<score>(\d\d?)|X).*?{ExtraContent}` with Singleline flag
  protected readonly parser = new RegExp(
    `Daily Savior #\\d+\\nGuesses: (?<${BasicScoreResultParser.SCORE_GROUP}>(\\d\\d?)|X).*?https://sedecordle.com/\\n#sedecordle`,
    's'
  );
  
  getScoreValue(dailyResult: DailyResult): string | null {
    if (!dailyResult.scores) return null;
    
    const values = Array.from({ length: 16 }, (_, i) => {
      if (dailyResult.scores && dailyResult.scores.length > i) {
        return dailyResult.scores[i].toString();
      }
      return 'X';
    });
    
    return `"${values.join(',')}"`;
  }
}
