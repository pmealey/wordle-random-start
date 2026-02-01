import { BasicScoreResultParser } from './base/basic-score-parser';

export class Moviedle2Parser extends BasicScoreResultParser {
  readonly countWinner = true;
  readonly gameName = 'Moviedle 2';
  readonly helpText = 'Guess a movie based on its similarities with your prior guesses.';
  protected readonly extraContent = 'Play here: ';
  readonly url = 'https://moviedle.xyz';
  
  // Matches "Moviedle #471 X/8" or "Moviedle #1186 1/8"
  // Note: C# uses [\d|X] which incorrectly includes literal pipe - fixed here to [\dX]
  protected readonly parser = new RegExp(
    `Moviedle #\\d+ (?<${BasicScoreResultParser.SCORE_GROUP}>[\\dX])/\\d`
  );
  
  protected getCleanResult(result: string, match: RegExpMatchArray): string {
    return result
      .replace(this.extraContent ?? '', '')
      .replace(this.url ?? '', '')
      .trim();
  }
}
