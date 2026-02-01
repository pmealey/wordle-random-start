import { DailyResult } from '../models/daily-result';
import { BasicScoreResultParser } from './base/basic-score-parser';

export class SlayTheSpireParser extends BasicScoreResultParser {
  readonly countWinner = true;
  readonly gameName = 'Slay the Spire Daily Challenge';
  readonly golfScoring = false;
  readonly helpText = 'Runs submitted after 7 PM ET count for tomorrow.\nEntry examples: "sts 700", "Sts 700", or "Slay the Spire 700".';
  protected readonly extraContent = null;
  readonly url = 'https://www.megacrit.com/';
  
  // Matches "Slay the Spire\n293" or "sts 700"
  // C# regex: `(slay the spire|sts) (?<score>\d+)` - requires exactly one space
  // TS version allows multiple whitespace/newlines for flexibility with multiline input
  protected readonly parser = new RegExp(
    `(slay the spire|sts)[\\s\\n]+(?<${BasicScoreResultParser.SCORE_GROUP}>\\d+)`,
    'i'
  );
  
  protected getCleanResult(result: string, match: RegExpMatchArray): string {
    const scoreStr = this.getScoreFromMatch(match);
    return 'Slay the Spire\n' + (scoreStr || '');
  }
  
  protected setScore(dailyResult: DailyResult, match: RegExpMatchArray): DailyResult {
    // The Slay the Spire daily challenges reset at midnight UTC, so the date of the daily result
    // should match the current UTC date.
    dailyResult.date = new Date().toISOString().split('T')[0];
    
    return super.setScore(dailyResult, match);
  }
  
  private getScoreFromMatch(match: RegExpMatchArray): string | null {
    if (match.groups && match.groups[BasicScoreResultParser.SCORE_GROUP]) {
      return match.groups[BasicScoreResultParser.SCORE_GROUP];
    }
    return null;
  }
}
