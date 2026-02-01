import { BasicScoreResultParser } from './base/basic-score-parser';

export class PoeltlParser extends BasicScoreResultParser {
  readonly countWinner = true;
  readonly gameName = 'Poeltl';
  readonly helpText = null;
  protected readonly extraContent = null;
  readonly url = 'https://poeltl.dunk.town/';
  
  // Matches "Poeltl 700 - X/8" or "Poeltl 86 - 1/8"
  // Note: C# uses [\d|X] which incorrectly includes literal pipe - fixed here to [\dX]
  protected readonly parser = new RegExp(
    `${this.gameName} \\d+ - (?<${BasicScoreResultParser.SCORE_GROUP}>[\\dX])/\\d`
  );
}
