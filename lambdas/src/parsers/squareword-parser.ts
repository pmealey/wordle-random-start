import { BasicScoreResultParser } from './base/basic-score-parser';

export class SquarewordParser extends BasicScoreResultParser {
  readonly countWinner = true;
  readonly gameName = 'Squareword';
  readonly helpText = null;
  protected readonly extraContent = '#squareword #squareword121';
  readonly url = 'https://squareword.org/';
  
  // Matches "squareword.org 1461: 6 guesses"
  protected readonly parser = new RegExp(
    `${this.gameName.toLowerCase()}.org \\d+: (?<${BasicScoreResultParser.SCORE_GROUP}>\\d+) guesses`
  );
  
  protected getCleanResult(result: string, match: RegExpMatchArray): string {
    const cleaned = result.replace(`${this.gameName.toLowerCase()}.org`, this.gameName.toLowerCase());
    return super.getCleanResult(cleaned, match);
  }
}
