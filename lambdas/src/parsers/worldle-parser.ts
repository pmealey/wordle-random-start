import { BasicScoreResultParser } from './base/basic-score-parser';

export class WorldleParser extends BasicScoreResultParser {
  readonly countWinner = true;
  readonly gameName = 'Worldle';
  readonly helpText = null;
  readonly url = 'https://worldle.teuteuf.fr';
  protected readonly extraContent = `${this.url}/share`;
  
  // Matches "#Worldle #1471 (31.01.2026) X/6" or "#Worldle #44 1/6"
  // Note: C# uses [\d|X] which incorrectly includes literal pipe - fixed here to [\dX]
  protected readonly parser = new RegExp(
    `#${this.gameName} .+?(?<${BasicScoreResultParser.SCORE_GROUP}>[\\dX])/\\d`
  );
}
