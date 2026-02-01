/**
 * DailyResult model - represents a game result submission
 * Ported from backend/Models/DailyResult.cs
 */
export interface DailyResult {
  /** Unique identifier (UUID) */
  id: string;
  
  /** Username of the player */
  user: string;
  
  /** Date of the result (YYYY-MM-DD) */
  date: string;
  
  /** Name of the game */
  game: string;
  
  /** The result text (formatted game output) */
  result: string;
  
  /** Optional numeric score */
  score?: number;
  
  /** Optional time in HH:MM:SS format */
  time?: string;
  
  /** Optional array of scores (for multi-part games like Quordle) */
  scores?: number[];
  
  /** List of groups this result belongs to */
  groups: string[];
  
  /** Composite sort key for DynamoDB (user#game) */
  userGame: string;
}

/**
 * Creates the userGame sort key from user and game
 */
export function createUserGameKey(user: string, game: string): string {
  return `${user.toLowerCase()}#${game}`;
}

/**
 * DailyWord model - represents the daily starting word
 * Ported from backend/Models/DailyWord.cs
 */
export interface DailyWord {
  /** Date (YYYY-MM-DD) - partition key */
  date: string;
  
  /** The 5-letter word */
  word: string;
}

/**
 * Group configuration
 * Ported from backend/Models/Group.cs
 */
export interface Group {
  name: string;
  selectGames: boolean;
  description?: string;
}

/**
 * Hardcoded groups (from GroupController.cs)
 */
export const GROUPS: Group[] = [
  { name: 'family', selectGames: true },
  { name: 'libo', selectGames: false },
  { name: 'powerschool', selectGames: false },
];

/**
 * Gets group names
 */
export function getGroupNames(): string[] {
  return GROUPS.map(g => g.name);
}

/**
 * Validates group names
 */
export function validateGroups(groups: string[]): { valid: boolean; invalid: string[] } {
  const validNames = getGroupNames();
  const invalid = groups.filter(g => !validNames.includes(g));
  return {
    valid: invalid.length === 0,
    invalid,
  };
}
