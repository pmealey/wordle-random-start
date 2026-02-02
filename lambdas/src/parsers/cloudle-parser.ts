import { BasicScoreResultParser } from './base/basic-score-parser';

export class CloudleParser extends BasicScoreResultParser {
  readonly countWinner = true;
  readonly gameName = 'Cloudle';
  readonly helpText = null;
  readonly url = 'https://cloudle.app/';
  protected readonly extraContent = this.url;
  
  // Note: C# uses [\d|X] which incorrectly includes literal pipe - fixed here to [\dX]
  protected readonly parser = new RegExp(
    `${this.gameName} .*? (?<${BasicScoreResultParser.SCORE_GROUP}>[\\dX])/\\d`
  );
}
