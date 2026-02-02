import { BasicScoreResultParser } from './base/basic-score-parser';

export class BandleParser extends BasicScoreResultParser {
  readonly countWinner = true;
  readonly gameName = 'Bandle';
  readonly helpText = null;
  readonly url = 'https://bandle.app/';
  protected readonly extraContent = this.url;
  
  // Matches "Bandle #611 x/6" or "Bandle #595 1/6"
  // Note: C# uses [\d|x] which incorrectly includes literal pipe - fixed here to [\dx]
  protected readonly parser = new RegExp(
    `${this.gameName} .+?(?<${BasicScoreResultParser.SCORE_GROUP}>[\\dx])/\\d`
  );
}
