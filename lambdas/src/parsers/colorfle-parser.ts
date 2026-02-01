import { BasicScoreResultParser } from './base/basic-score-parser';

export class ColorfleParser extends BasicScoreResultParser {
  readonly countWinner = true;
  readonly gameName = 'Colorfle';
  readonly helpText = "Select 'NORMAL' from the difficulty selector.";
  protected readonly extraContent = null;
  readonly url = 'https://colorfle.com/';
  
  // Matches "Colorfle 773 X/6" or "Colorfle 624 2/6"
  // Note: C# uses [\d|X] which incorrectly includes literal pipe - fixed here to [\dX]
  protected readonly parser = new RegExp(
    `${this.gameName} \\d+ (?<${BasicScoreResultParser.SCORE_GROUP}>[\\dX])/\\d`
  );
}
