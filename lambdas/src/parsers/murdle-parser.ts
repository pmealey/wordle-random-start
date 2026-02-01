import { DailyResult } from '../models/daily-result';
import { ResultParser, getGroup, hasGroup } from './base/result-parser';

export class MurdleParser extends ResultParser {
  readonly countWinner = true;
  readonly gameName = 'Murdle';
  readonly golfScoring = true;
  readonly helpText = null;
  readonly url = 'https://murdle.com/';
  
  private static readonly SCORE_GROUP = 'score';
  private static readonly TIME_GROUP = 'time';
  
  // Matches "Murdle for 12/4/2025\n\n👤🔪🏡     🕰️\n✅✅✅     3️⃣:4️⃣3️⃣"
  protected readonly parser = new RegExp(
    `${this.gameName} for [\\d/]+[^✅❌]+(?<${MurdleParser.SCORE_GROUP}>[✅❌]+)\\s+(?<${MurdleParser.TIME_GROUP}>[:0123456789\uFE0F\u20E3]+)`,
    's'
  );
  
  protected getCleanResult(result: string, match: RegExpMatchArray): string {
    // Note: C# uses result[..streakEmojisStart] without checking if IndexOf returns -1
    // TS adds safety check to handle case where ⚖️ is not present
    const streakEmojisStart = result.indexOf('⚖️');
    if (streakEmojisStart > -1) {
      return result.substring(0, streakEmojisStart).trim();
    }
    return result.trim();
  }
  
  getScoreValue(dailyResult: DailyResult): string | null {
    const scoreStr = dailyResult.score?.toString() ?? '';
    const timeStr = dailyResult.time ?? '';
    return `${scoreStr} - ${timeStr}`;
  }
  
  protected setScore(dailyResult: DailyResult, match: RegExpMatchArray): DailyResult {
    if (hasGroup(match, MurdleParser.SCORE_GROUP)) {
      // Score is the number of failures (❌) - fewer failures = better
      const scoreStr = getGroup(match, MurdleParser.SCORE_GROUP) || '';
      dailyResult.score = scoreStr.split('❌').length - 1;
    }
    
    if (hasGroup(match, MurdleParser.TIME_GROUP)) {
      // Parse time with emoji digits
      const timeStr = (getGroup(match, MurdleParser.TIME_GROUP) || '')
        .replace(/\uFE0F/g, '')
        .replace(/\u20E3/g, '');
      
      const time = this.parseTimeSpanString(timeStr);
      if (time) {
        dailyResult.time = time;
      }
    }
    
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
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
}
