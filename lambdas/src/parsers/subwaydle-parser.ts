import { BasicScoreResultParser } from './base/basic-score-parser';

export class SubwaydleParser extends BasicScoreResultParser {
  readonly countWinner = true;
  readonly gameName = 'Subwaydle';
  readonly helpText = null;
  protected readonly extraContent = null;
  readonly url = 'https://www.subwaydle.com/';
  
  // Matches "Subwaydle 727 X/6" or "Subwaydle 274 (Weekend Edition) 1/6"
  // Note: C# uses [\d|X] which incorrectly includes literal pipe - fixed here to [\dX]
  protected readonly parser = new RegExp(
    `${this.gameName} \\d+ \\(?[^)]*\\)? ?(?<${BasicScoreResultParser.SCORE_GROUP}>[\\dX])/\\d`
  );
}
