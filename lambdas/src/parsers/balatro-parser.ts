import { DailyResult } from '../models/daily-result';
import { ResultParser, getGroup, hasGroup } from './base/result-parser';
import { getNowEasternStandardTime } from '../utils/time-utility';

export class BalatroParser extends ResultParser {
  readonly countWinner = true;
  readonly gameName = 'Balatro Daily Challenge';
  readonly golfScoring = false;
  readonly url = 'https://www.playbalatro.com/';
  
  private readonly randomDeck: string;
  private readonly randomStake: string;
  
  constructor() {
    super();
    
    const nowEt = getNowEasternStandardTime();
    const seed = nowEt.getFullYear() * 10000 + (nowEt.getMonth() + 1) * 100 + nowEt.getDate();
    
    // Note: Uses different RNG algorithm than C# backend (LCG vs Knuth subtractive)
    const rand = this.seededRandom(seed);
    
    const decks = [
      'Red', 'Blue', 'Yellow', 'Green', 'Black', 'Magic', 'Nebula',
      'Ghost', 'Abandoned', 'Checkered', 'Zodiac', 'Painted',
      'Anaglyph', 'Plasma', 'Erratic'
    ];
    
    const stakes = [
      'White', 'Red', 'Green', 'Black', 'Blue', 'Purple', 'Orange', 'Gold'
    ];
    
    this.randomDeck = decks[Math.floor(rand() * decks.length)];
    this.randomStake = stakes[Math.floor(rand() * stakes.length)];
  }
  
  private seededRandom(seed: number): () => number {
    return () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }
  
  get helpText(): string {
    return `Seed: today's random word.\nDeck: ${this.randomDeck}.\nStake: ${this.randomStake}.\nEntry examples: "b 9 16 60000", "B a 9 r 16 bh 60000", or "Balatro ante 9 round 16 best hand 60,000".`;
  }
  
  protected readonly parser = new RegExp(
    `(balatro|b) (a|ante)? ?(?<ante>\\d+) (r|round)? ?(?<round>\\d+) (bh|best hand)? ?(?<bestHand>[\\d,.]+)`,
    'i'
  );
  
  protected getCleanResult(result: string, match: RegExpMatchArray): string {
    if (!hasGroup(match, 'ante') || !hasGroup(match, 'round') || !hasGroup(match, 'bestHand')) {
      return 'Balatro';
    }
    
    const ante = getGroup(match, 'ante') || '';
    const round = getGroup(match, 'round') || '';
    const bestHand = getGroup(match, 'bestHand') || '';
    
    return `Balatro\nAnte: ${ante}\nRound: ${round}\nBest hand: ${bestHand}`;
  }
  
  getScoreValue(dailyResult: DailyResult): string | null {
    if (!dailyResult.scores) return null;
    return dailyResult.scores.join(', ');
  }
  
  protected setScore(dailyResult: DailyResult, match: RegExpMatchArray): DailyResult {
    if (!hasGroup(match, 'ante') || !hasGroup(match, 'round') || !hasGroup(match, 'bestHand')) {
      return dailyResult;
    }
    
    // Strip thousands separators (commas) to match C#'s NumberStyles.AllowThousands behavior
    const anteStr = (getGroup(match, 'ante') || '0').replace(/,/g, '');
    const roundStr = (getGroup(match, 'round') || '0').replace(/,/g, '');
    // bestHand strips both commas and periods (for different locale formats)
    const bestHandStr = (getGroup(match, 'bestHand') || '0').replace(/[,.]/g, '');
    
    dailyResult.scores = [
      parseInt(anteStr, 10),
      parseInt(roundStr, 10),
      parseInt(bestHandStr, 10)
    ];
    
    return dailyResult;
  }
}
