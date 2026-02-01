import { DailyResult } from '../models/daily-result';
import { BasicScoreResultParser } from './base/basic-score-parser';
import { getGroup, hasGroup } from './base/result-parser';

export class Moviedle1Parser extends BasicScoreResultParser {
  readonly countWinner = true;
  readonly gameName = 'Moviedle 1';
  readonly helpText = 'Guess a movie from a compressed 1-6 second version of it.';
  protected readonly extraContent = this.url;
  readonly url = 'https://moviedle.app';
  
  // Captures emoji line: "#Moviedle #2024-02-18 \n\n 🎥 ⬛️ ⬛️ ⬛️..."
  protected readonly parser = new RegExp(
    `#Moviedle #[\\d-]+.*?\\n\\n\\s*🎥(?<${BasicScoreResultParser.SCORE_GROUP}>[^\\n]*)`,
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
