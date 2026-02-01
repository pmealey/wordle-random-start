import { BasicScoreResultParser } from './base/basic-score-parser';

export class WaffleParser extends BasicScoreResultParser {
  readonly countWinner = true;
  readonly gameName = 'Waffle';
  readonly golfScoring = false;
  readonly helpText = null;
  protected readonly extraContent = 'wafflegame.net';
  readonly url = 'https://wafflegame.net/';
  
  // Matches "#waffle1395 X/5" or "#waffle113 0/5"
  // Note: C# uses [\d|X] which incorrectly includes literal pipe - fixed here to [\dX]
  protected readonly parser = new RegExp(
    `#${this.gameName.toLowerCase()}\\d+ (?<${BasicScoreResultParser.SCORE_GROUP}>[\\dX])/\\d`
  );
}
