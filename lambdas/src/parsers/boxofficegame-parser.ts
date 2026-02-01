import { BasicScoreResultParser } from './base/basic-score-parser';

export class BoxOfficeGameParser extends BasicScoreResultParser {
  readonly countWinner = true;
  readonly gameName = 'Box Office Game';
  override readonly golfScoring = false;
  readonly helpText = null;
  readonly url = 'https://boxofficega.me/';
  protected readonly extraContent = '';
  
  // Matches "boxofficega.me\n...\n🏆 920"
  protected readonly parser = new RegExp(
    `boxofficega\\.me.*?🏆 (?<${BasicScoreResultParser.SCORE_GROUP}>[\\d]+)`,
    's'
  );
  
  protected override getCleanResult(result: string, match: RegExpMatchArray): string {
    return result.replace('boxofficega.me', 'boxofficegame');
  }
}
