import { BasicScoreResultParser } from './base/basic-score-parser';

export class TradleParser extends BasicScoreResultParser {
  readonly countWinner = true;
  readonly gameName = 'Tradle';
  readonly helpText = null;
  readonly url = 'https://oec.world/en/games/tradle';
  protected readonly extraContent = this.url;
  
  // Note: C# uses [\d|X] which incorrectly includes literal pipe - fixed here to [\dX]
  protected readonly parser = new RegExp(
    `#${this.gameName} #\\d+ (?<${BasicScoreResultParser.SCORE_GROUP}>[\\dX])/\\d`
  );
}
