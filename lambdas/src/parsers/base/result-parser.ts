import { DailyResult, createUserGameKey } from '../../models/daily-result';
import { v4 as uuidv4 } from 'uuid';

/**
 * Base class for all game result parsers
 * Ported from backend/Services/ResultParser.cs
 */
export abstract class ResultParser {
  /** Whether this game counts towards leaderboard winners */
  abstract readonly countWinner: boolean;
  
  /** The name of the game */
  abstract readonly gameName: string;
  
  /** Whether lower scores are better (golf scoring) */
  abstract readonly golfScoring: boolean;
  
  /** Optional help text for the game */
  abstract readonly helpText: string | null;
  
  /** When to hide this game (defaults to never) */
  readonly hideAfter: Date = new Date('9999-12-31');
  
  /** The regex pattern to match this game's results */
  protected abstract readonly parser: RegExp;
  
  /** URL to play this game */
  abstract readonly url: string | null;
  
  /**
   * Cleans up the result text after parsing
   */
  protected abstract getCleanResult(result: string, match: RegExpMatchArray): string;
  
  /**
   * Gets a string representation of the score for CSV export
   */
  abstract getScoreValue(dailyResult: DailyResult): string | null;
  
  /**
   * Sets the score on the daily result from the parsed match
   */
  protected abstract setScore(dailyResult: DailyResult, match: RegExpMatchArray): DailyResult;
  
  /**
   * Attempts to parse a result string into a DailyResult
   * Returns null if this parser doesn't match the result
   */
  tryParse(user: string, date: string, result: string): DailyResult | null {
    const match = this.parser.exec(result);
    if (!match) {
      return null;
    }
    
    let cleanResult = result;
    cleanResult = this.getCleanResult(cleanResult, match);
    
    // Automatically strip out the URL
    if (this.url) {
      const urlWithoutTrailingSlash = this.url.replace(/\/$/, '');
      cleanResult = cleanResult.replace(urlWithoutTrailingSlash + '/', '');
      cleanResult = cleanResult.replace(urlWithoutTrailingSlash, '');
    }
    
    // Automatically strip out extra whitespace
    cleanResult = cleanResult.replace(/\n{3,}/g, '\n\n');
    cleanResult = cleanResult.trim();
    
    let dailyResult: DailyResult = {
      id: uuidv4(),
      date,
      game: this.gameName,
      result: cleanResult,
      user,
      groups: [],
      userGame: createUserGameKey(user, this.gameName),
    };
    
    dailyResult = this.setScore(dailyResult, match);
    
    return dailyResult;
  }
}

/**
 * Helper to get named capture group from match
 */
export function getGroup(match: RegExpMatchArray, name: string): string | undefined {
  return match.groups?.[name];
}

/**
 * Helper to check if named capture group exists
 */
export function hasGroup(match: RegExpMatchArray, name: string): boolean {
  return match.groups !== undefined && name in match.groups;
}
