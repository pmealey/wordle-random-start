import { DailyResult } from '../../models/daily-result';
import { ResultParser, getGroup, hasGroup } from './result-parser';

/**
 * Base class for parsers that extract a time score
 * Ported from backend/Services/BasicTimeResultParser.cs
 */
export abstract class BasicTimeResultParser extends ResultParser {
  readonly golfScoring = true;
  
  protected static readonly TIME_GROUP = 'time';
  
  protected getCleanResult(result: string, match: RegExpMatchArray): string {
    if (!hasGroup(match, BasicTimeResultParser.TIME_GROUP)) {
      return this.gameName;
    }
    
    const timeStr = getGroup(match, BasicTimeResultParser.TIME_GROUP);
    const time = this.parseTimeString(timeStr || '', match);
    
    if (time === null) {
      return this.gameName;
    }
    
    const formatted = this.formatTimeForDisplay(time);
    return `${this.gameName}\n${formatted}`;
  }
  
  getScoreValue(dailyResult: DailyResult): string | null {
    return dailyResult.time ?? null;
  }
  
  protected setScore(dailyResult: DailyResult, match: RegExpMatchArray): DailyResult {
    if (!hasGroup(match, BasicTimeResultParser.TIME_GROUP)) {
      return dailyResult;
    }
    
    const timeStr = getGroup(match, BasicTimeResultParser.TIME_GROUP);
    const time = this.parseTimeString(timeStr || '', match);
    
    if (time !== null) {
      dailyResult.time = time;
    }
    
    return dailyResult;
  }
  
  /**
   * Parses a time string into HH:MM:SS format
   */
  protected parseTimeString(timeSpan: string, match: RegExpMatchArray): string | null {
    // Replace dots with colons
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
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  
  /**
   * Formats time for display (e.g., "1 hour, 2 minutes, 3 seconds")
   */
  protected formatTimeForDisplay(time: string): string {
    const parts = time.split(':').map(p => parseInt(p, 10));
    const [hours, minutes, seconds] = parts;
    
    const result: string[] = [];
    
    if (hours > 0) {
      result.push(`${hours} hour${hours === 1 ? '' : 's'}`);
    }
    if (minutes > 0) {
      result.push(`${minutes} minute${minutes === 1 ? '' : 's'}`);
    }
    if (seconds > 0) {
      result.push(`${seconds} second${seconds === 1 ? '' : 's'}`);
    }
    
    return result.join(', ');
  }
}
