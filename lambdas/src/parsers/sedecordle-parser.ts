import { DailyResult } from '../models/daily-result';
import { BasicScoreResultParser } from './base/basic-score-parser';
import { getGroup, hasGroup } from './base/result-parser';

export class SedecordleParser extends BasicScoreResultParser {
  readonly countWinner = true;
  readonly gameName = 'Sedecordle';
  readonly helpText = null;
  readonly url = 'https://www.sedecordle.com/?mode=daily';
  protected readonly extraContent = 'sedecordle.com\n#sedecordle';
  
  // Matches "Daily #1374\n1️⃣8️⃣⬛0️⃣4️⃣..." - captures the score block
  // C# regex: `Daily #[^\n]+\n(?<score>.*?)\n{ExtraContent}` with Singleline flag
  protected readonly parser = new RegExp(
    `Daily #[^\\n]+\\n(?<${BasicScoreResultParser.SCORE_GROUP}>.*?)\\nsedecordle.com\\n#sedecordle`,
    's'
  );
  
  override getScoreValue(dailyResult: DailyResult): string | null {
    if (!dailyResult.scores) return null;
    
    const values = Array.from({ length: 16 }, (_, i) => {
      if (dailyResult.scores && dailyResult.scores.length > i) {
        return dailyResult.scores[i].toString();
      }
      return 'X';
    });
    
    return `"${values.join(',')}"`;
  }
  
  protected override setScore(dailyResult: DailyResult, match: RegExpMatchArray): DailyResult {
    if (!hasGroup(match, BasicScoreResultParser.SCORE_GROUP)) {
      return dailyResult;
    }
    
    const scoresText = getGroup(match, BasicScoreResultParser.SCORE_GROUP) || '';
    
    // Parse emoji digits: 0️⃣ through 9️⃣
    // These are composed of digit + \uFE0F + \u20E3
    const digitMatches = scoresText.matchAll(/[\d\uFE0F\u20E3]+/g);
    const scores: number[] = [];
    
    for (const digitMatch of digitMatches) {
      const value = digitMatch[0]
        .replace(/\uFE0F/g, '')
        .replace(/\u20E3/g, '');
      const score = parseInt(value, 10);
      if (!isNaN(score)) {
        scores.push(score);
      }
    }
    
    if (scores.length > 0) {
      dailyResult.scores = scores;
    }
    
    return dailyResult;
  }
}
