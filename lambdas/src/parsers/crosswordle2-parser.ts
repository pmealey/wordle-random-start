import { BasicScoreResultParser } from './base/basic-score-parser';

export class Crosswordle2Parser extends BasicScoreResultParser {
  readonly countWinner = true;
  readonly gameName = 'Crosswordle 2';
  readonly helpText = 'Guess a two word phrase.';
  protected readonly extraContent = this.url;
  readonly url = 'https://crosswordle.serializer.ca/';
  
  // Match "Crosswordle 123 ... 5/6" - score is before the slash
  protected readonly parser = new RegExp(
    `^Crosswordle \\d+ .*? (?<${BasicScoreResultParser.SCORE_GROUP}>[\\d]+)/`,
    'm'
  );
}
