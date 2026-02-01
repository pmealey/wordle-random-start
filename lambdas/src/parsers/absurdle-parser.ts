import { BasicScoreResultParser } from './base/basic-score-parser';

export class AbsurdleParser extends BasicScoreResultParser {
  readonly countWinner = false;
  readonly gameName = 'Absurdle';
  readonly helpText = 'Start with today\'s random word.';
  protected readonly extraContent = this.url;
  readonly url = 'https://qntm.org/files/absurdle/absurdle.html';
  
  protected readonly parser = new RegExp(
    `${this.gameName} (?<${BasicScoreResultParser.SCORE_GROUP}>\\d+)/`
  );
}
