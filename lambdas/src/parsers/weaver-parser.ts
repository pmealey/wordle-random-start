import { DailyResult } from '../models/daily-result';
import { BasicScoreResultParser } from './base/basic-score-parser';
import { getGroup, hasGroup } from './base/result-parser';

export class WeaverParser extends BasicScoreResultParser {
  readonly countWinner = true;
  readonly gameName = 'Weaver';
  readonly helpText = 'Alternate entry: "Weaver X", where X is your score.';
  protected readonly extraContent = null;
  readonly url = 'https://wordwormdormdork.com/';
  
  // Match either:
  // 1. Grid format: "Weaver ... word\n🟩⬜️🟩⬜️..." (count newlines)
  // 2. Simple format: "Weaver 4" (direct number)
  protected readonly parser = new RegExp(
    `${this.gameName}([^a-zA-Z]+[a-zA-Z]+\\n(?<scoreLines>[^a-zA-Z]+)| (?<scoreNum>\\d+))`,
    's'
  );
  
  protected setScore(dailyResult: DailyResult, match: RegExpMatchArray): DailyResult {
    // Check for direct number format first
    if (hasGroup(match, 'scoreNum')) {
      const scoreNum = getGroup(match, 'scoreNum');
      if (scoreNum) {
        dailyResult.score = parseInt(scoreNum, 10);
        return dailyResult;
      }
    }
    
    // Check for grid format (count newlines)
    if (hasGroup(match, 'scoreLines')) {
      const scoreLines = getGroup(match, 'scoreLines');
      if (scoreLines && scoreLines.trim()) {
        dailyResult.score = (scoreLines.match(/\n/g) || []).length;
      }
    }
    
    return dailyResult;
  }
}
