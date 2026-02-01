import { BasicScoreResultParser } from './base/basic-score-parser';

export class LewdleParser extends BasicScoreResultParser {
  readonly countWinner = true;
  readonly gameName = 'Lewdle';
  readonly helpText = null;
  protected readonly extraContent = 'lewdlegame.com';
  readonly url = 'https://www.lewdlegame.com';
  
  // Matches "Lewdle 🍆💦 122 x/6" or "Lewdle 🍆💦 100 2/6"
  protected readonly parser = new RegExp(
    `${this.gameName}.*?(?<${BasicScoreResultParser.SCORE_GROUP}>[\\dxX])/\\d`
  );
}
