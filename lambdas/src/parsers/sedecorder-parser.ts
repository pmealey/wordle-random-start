import { DailyResult } from '../models/daily-result';
import { BasicScoreResultParser } from './base/basic-score-parser';
import { getGroup, hasGroup } from './base/result-parser';

export class SedecOrderParser extends BasicScoreResultParser {
  readonly countWinner = true;
  readonly gameName = 'Sedec-order';
  readonly helpText = null;
  protected readonly extraContent = 'https://sedecordle.com/\n#sedecordle  #sedecorder';
  readonly url = 'https://www.sedecordle.com/sedec-order';
  
  // Matches "Daily Sedec-order #1087\nGuesses: 18/21" or "X/21"
  // C# regex: `Daily {GameName} #\d+\nGuesses: (?<score>(\d\d?)|X).*?{ExtraContent}` with Singleline flag
  protected readonly parser = new RegExp(
    `Daily ${this.gameName} #\\d+\\nGuesses: (?<${BasicScoreResultParser.SCORE_GROUP}>(\\d\\d?)|X).*?https://sedecordle.com/\\n#sedecordle  #sedecorder`,
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
