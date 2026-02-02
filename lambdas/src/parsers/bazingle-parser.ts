import { BasicScoreResultParser } from './base/basic-score-parser';

export class BazingleParser extends BasicScoreResultParser {
  readonly countWinner = false;
  readonly gameName = 'Bazingle';
  readonly helpText = null;
  readonly url = 'https://bazingle.wook.wtf';
  protected readonly extraContent = this.url;
  
  // Matches "Bazingle 683 1/8"
  // Note: C# uses [\d|X|x] which incorrectly includes literal pipes - fixed here to [\dXx]
  protected readonly parser = new RegExp(
    `${this.gameName} .+?(?<${BasicScoreResultParser.SCORE_GROUP}>[\\dXx])/\\d`
  );
}
