import { BasicScoreResultParser } from './base/basic-score-parser';

export class BazingleParser extends BasicScoreResultParser {
  readonly countWinner = false;
  readonly gameName = 'Bazingle';
  readonly helpText = null;
  protected readonly extraContent = this.url;
  readonly url = 'https://bazingle.wook.wtf';
  
  // Matches "Bazingle 683 1/8"
  // Note: C# uses [\d|X|x] which incorrectly includes literal pipes - fixed here to [\dXx]
  protected readonly parser = new RegExp(
    `${this.gameName} .+?(?<${BasicScoreResultParser.SCORE_GROUP}>[\\dXx])/\\d`
  );
}
