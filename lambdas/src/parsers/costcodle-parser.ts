import { BasicScoreResultParser } from './base/basic-score-parser';

export class CostcodleParser extends BasicScoreResultParser {
  readonly countWinner = true;
  readonly gameName = 'Costcodle';
  readonly helpText = null;
  readonly url = 'https://costcodle.com';
  protected readonly extraContent = this.url;
  
  // Matches "Costcodle #866 X/6"
  // Note: C# uses [\d|X] which incorrectly includes literal pipe - fixed here to [\dX]
  protected readonly parser = new RegExp(
    `${this.gameName} #\\d+ (?<${BasicScoreResultParser.SCORE_GROUP}>[\\dX])/\\d`
  );
  
  protected getCleanResult(result: string, match: RegExpMatchArray): string {
    return result
      .replace('https://costcodle.com/', '')
      .replace('https://costcodle.com', '')
      .trim();
  }
}
