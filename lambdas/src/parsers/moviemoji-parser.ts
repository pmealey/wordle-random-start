import { BasicScoreResultParser } from './base/basic-score-parser';

export class MoviemojiParser extends BasicScoreResultParser {
  readonly countWinner = true;
  readonly gameName = 'Moviemoji';
  readonly helpText = null;
  protected readonly extraContent = 'Play here: ';
  readonly url = 'https://moviedle.xyz/moviemoji/';
  
  // Matches "Moviemoji #489 X/8" or "Moviemoji #465 1/8"
  // Note: C# uses [\d|X] which incorrectly includes literal pipe - fixed here to [\dX]
  protected readonly parser = new RegExp(
    `${this.gameName} #\\d+ (?<${BasicScoreResultParser.SCORE_GROUP}>[\\dX])/\\d`
  );
  
  protected getCleanResult(result: string, match: RegExpMatchArray): string {
    return result
      .replace(this.extraContent ?? '', '')
      .replace(this.url ?? '', '')
      .trim();
  }
}
