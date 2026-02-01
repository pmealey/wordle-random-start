import { BasicScoreResultParser } from './base/basic-score-parser';

export class NerdleParser extends BasicScoreResultParser {
  readonly countWinner = true;
  readonly gameName = 'Nerdle';
  readonly helpText = null;
  protected readonly extraContent = `${this.url} #nerdle`;
  readonly url = 'https://nerdlegame.com';
  
  // Matches "nerdlegame 827 3/6"
  // Note: C# uses [\d|X] which incorrectly includes literal pipe - fixed here to [\dX]
  protected readonly parser = new RegExp(
    `${this.gameName.toLowerCase()}game \\d+ (?<${BasicScoreResultParser.SCORE_GROUP}>[\\dX])/\\d`
  );
}
