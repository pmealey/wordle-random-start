import { BasicScoreResultParser } from './base/basic-score-parser';

export class AntiwordleParser extends BasicScoreResultParser {
  readonly countWinner = true;
  readonly gameName = 'Antiwordle';
  override readonly golfScoring = false;
  readonly helpText = null;
  readonly url = 'https://www.antiwordle.com/';
  protected readonly extraContent = null;
  
  protected readonly parser = new RegExp(
    `${this.gameName} #\\d+\\s*(?<${BasicScoreResultParser.SCORE_GROUP}>\\d+) guesses`,
    's'
  );
}
