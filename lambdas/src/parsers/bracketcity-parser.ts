import { BasicScoreResultParser } from './base/basic-score-parser';

export class BracketCityParser extends BasicScoreResultParser {
  readonly countWinner = true;
  readonly gameName = 'Bracket City';
  readonly golfScoring = false;
  readonly helpText = null;
  protected readonly extraContent = null;
  readonly url = 'https://www.theatlantic.com/games/bracket-city';
  
  // Matches "[Bracket City]\n...\nTotal Score: 91.0" - C# uses brackets and "Total Score:" pattern
  protected readonly parser = new RegExp(
    `\\[${this.gameName}\\].+?Total Score: (?<${BasicScoreResultParser.SCORE_GROUP}>\\d+)\\.\\d+`,
    's'
  );
}
