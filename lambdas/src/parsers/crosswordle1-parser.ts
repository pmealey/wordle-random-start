import { BasicTimeResultParser } from './base/basic-time-parser';

export class Crosswordle1Parser extends BasicTimeResultParser {
  readonly countWinner = true;
  readonly gameName = 'Crosswordle 1';
  readonly helpText = 'Reverse engineer a Wordle grid as fast as possible.';
  readonly url = 'https://crosswordle.vercel.app/';
  
  // Match "Daily Crosswordle 123: 5m 23s" or "Daily Crosswordle 123: 45s"
  protected readonly parser = new RegExp(
    `Daily Crosswordle \\d+: (?<${BasicTimeResultParser.TIME_GROUP}>(?<timePart1>\\d+)[ms] ?(?<timePart2>\\d*)s?)`
  );
  
  protected getCleanResult(result: string, match: RegExpMatchArray): string {
    return result
      .replace(this.url + '?daily=1', '')
      .replace(/\n\n/g, '\n')
      .trim();
  }
  
  protected parseTimeString(timeStr: string, match: RegExpMatchArray): string | null {
    const timePart1 = match.groups?.timePart1;
    const timePart2 = match.groups?.timePart2;
    
    if (!timePart1) return null;
    
    let minutes = 0;
    let seconds = 0;
    
    // If contains 'm', it's minutes and seconds
    if (timeStr.includes('m') && timePart2) {
      minutes = parseInt(timePart1, 10);
      seconds = parseInt(timePart2, 10);
      if (isNaN(minutes) || isNaN(seconds)) return null;
    } else {
      // Just seconds
      seconds = parseInt(timePart1, 10);
      if (isNaN(seconds)) return null;
    }
    
    return `00:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
}
