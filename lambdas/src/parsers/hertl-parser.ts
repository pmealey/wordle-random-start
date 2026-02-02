import { BasicScoreResultParser } from './base/basic-score-parser';

export class HertlParser extends BasicScoreResultParser {
  readonly countWinner = true;
  readonly gameName = 'Hertl';
  readonly helpText = null;
  readonly url = 'https://www.hertl.app';
  protected readonly extraContent = this.url;
  
  // Matches "HERTL (Game #813) - X / 8" or "HERTL (Game #690) - 5 / 8"
  // Note: C# uses [\d|X] which incorrectly includes literal pipe - fixed here to [\dX]
  protected readonly parser = new RegExp(
    `HERTL \\(Game #\\d+\\) - (?<${BasicScoreResultParser.SCORE_GROUP}>[\\dX]) / \\d`
  );
}
