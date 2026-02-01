import { BasicScoreResultParser } from './base/basic-score-parser';

export class GlobleParser extends BasicScoreResultParser {
  readonly countWinner = true;
  readonly gameName = 'Globle';
  readonly helpText = null;
  protected readonly extraContent = null;
  readonly url = 'https://globle-game.com';
  
  // Matches "🌎 Sep 4, 2024 🌍\n...\n🟨🟥🟩 = 3"
  protected readonly parser = new RegExp(
    `🌎.*?🌍[\\s\\n\\r]+[^=]*= (?<${BasicScoreResultParser.SCORE_GROUP}>\\d+)`
  );
  
  protected getCleanResult(result: string, match: RegExpMatchArray): string {
    return result
      .replace('#globle', '')
      .replace(this.url ?? '', '')
      .trim();
  }
}
