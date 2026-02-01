import { BasicScoreResultParser } from './base/basic-score-parser';

export class KindaHardGolfParser extends BasicScoreResultParser {
  readonly countWinner = true;
  readonly gameName = 'Kinda Hard Golf';
  readonly helpText = null;
  protected readonly extraContent = null;
  readonly url = 'https://kindahard.golf';
  
  // Matches "kindahard.golf 01/25\n\n📝 10" - looks for 📝 emoji before score
  protected readonly parser = new RegExp(
    `kindahard\\.golf.+?📝 (?<${BasicScoreResultParser.SCORE_GROUP}>\\d+)`,
    's'
  );
}
