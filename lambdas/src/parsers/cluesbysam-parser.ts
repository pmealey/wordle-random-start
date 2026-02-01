import { DailyResult } from '../models/daily-result';
import { ResultParser, getGroup, hasGroup } from './base/result-parser';

export class CluesBySamParser extends ResultParser {
  readonly countWinner = true;
  readonly gameName = 'Clues by Sam';
  readonly golfScoring = true;
  readonly helpText = 'Fewer mistakes/hints/clues is better than a faster time';
  readonly url = 'https://cluesbysam.com';
  
  private static readonly TIME_GROUP = 'time';
  
  // Matches "I solved the daily #CluesBySam, Jan 28th 2026 (Tricky), in less than 11 minutes"
  // or "I solved the daily #CluesBySam, Jan 30th 2026 (Tricky), in 04:34"
  // Note: No 's' flag - C# doesn't use Singleline so .* stops at newlines
  protected readonly parser = new RegExp(
    `.*?(Clues by Sam|#CluesBySam).*?in (?<${CluesBySamParser.TIME_GROUP}>.*)`
  );
  
  protected getCleanResult(result: string, match: RegExpMatchArray): string {
    return result;
  }
  
  getScoreValue(dailyResult: DailyResult): string | null {
    return (dailyResult.score?.toString() ?? '') + ' - ' + (dailyResult.time ?? '');
  }
  
  protected setScore(dailyResult: DailyResult, match: RegExpMatchArray): DailyResult {
    if (!hasGroup(match, CluesBySamParser.TIME_GROUP)) {
      return dailyResult;
    }
    
    let timeString = getGroup(match, CluesBySamParser.TIME_GROUP) || '';
    
    // Handle "less than X minutes" format
    if (timeString.startsWith('less than')) {
      timeString = timeString
        .replace('less than ', '')
        .replace('minutes', '')
        .trim();
      
      const minutes = parseInt(timeString, 10);
      if (!isNaN(minutes)) {
        dailyResult.time = this.formatTime(0, minutes, 0);
      }
    } else {
      // Handle "MM:SS" or "M.SS" format
      const time = this.parseTimeSpanString(timeString);
      if (time) {
        dailyResult.time = time;
      }
    }
    
    // Count green emojis for score
    const greenCount = (dailyResult.result?.match(/🟩/g) || []).length;
    dailyResult.score = greenCount;
    
    return dailyResult;
  }
  
  /**
   * Parses a time string into HH:MM:SS format
   * Supports: H:MM:SS, M:SS, and SS formats (matching C# BasicTimeResultParser)
   */
  private parseTimeSpanString(timeSpan: string): string | null {
    // Replace dots with colons (for alternate formats like 1.30)
    timeSpan = timeSpan.replace(/\./g, ':');
    
    const colonCount = (timeSpan.match(/:/g) || []).length;
    
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    
    if (colonCount === 2) {
      // H:MM:SS
      const parts = timeSpan.split(':');
      hours = parseInt(parts[0], 10);
      minutes = parseInt(parts[1], 10);
      seconds = parseInt(parts[2], 10);
    } else if (colonCount === 1) {
      // M:SS
      const parts = timeSpan.split(':');
      minutes = parseInt(parts[0], 10);
      seconds = parseInt(parts[1], 10);
    } else {
      // SS
      seconds = parseInt(timeSpan, 10);
    }
    
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
      return null;
    }
    
    return this.formatTime(hours, minutes, seconds);
  }
  
  private formatTime(hours: number, minutes: number, seconds: number): string {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
