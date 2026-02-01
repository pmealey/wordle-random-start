import { BasicScoreResultParser } from './base/basic-score-parser';

export class ColorfleHardModeParser extends BasicScoreResultParser {
  readonly countWinner = true;
  readonly gameName = 'Colorfle (Hard mode)';
  readonly helpText = "Select 'HARD' from the difficulty selector.";
  protected readonly extraContent = null;
  readonly url = 'https://colorfle.com/';
  
  // Matches "Colorfle 767 (Hard mode) X/6"
  // Note: C# uses [\d|X] which incorrectly includes literal pipe - fixed here to [\dX]
  protected readonly parser = new RegExp(
    `Colorfle \\d+ \\(Hard mode\\) (?<${BasicScoreResultParser.SCORE_GROUP}>[\\dX])/\\d`
  );
}
