import { DailyResult } from '../models/daily-result';
import { ResultParser } from './base/result-parser';

export class RoguleParser extends ResultParser {
  readonly countWinner = false;
  readonly gameName = 'Rogule';
  readonly golfScoring = false;
  readonly helpText = 'Escaping with more treasure > more foes defeated > fewer steps';
  readonly url = 'https://rogule.com';
  
  protected readonly parser = new RegExp(`#${this.gameName}`);
  
  protected getCleanResult(result: string, match: RegExpMatchArray): string {
    // Note: C# removes URL first then URL+"/", which leaves "/" if input has "https://rogule.com/"
    // TS removes URL+"/" first (more specific) then URL to handle both cases correctly
    return result
      .replace(this.url + '/', '')
      .replace(this.url, '')
      .trim();
  }
  
  getScoreValue(dailyResult: DailyResult): string | null {
    return dailyResult.scores?.toString() ?? null;
  }
  
  private getResultLine(lines: string[], index: number): string {
    return lines.length > index ? lines[index] : '';
  }
  
  protected setScore(dailyResult: DailyResult, match: RegExpMatchArray): DailyResult {
    if (dailyResult.result.includes('⛩')) {
      const lines = dailyResult.result.split('\n');
      
      // Parse steps
      const stepsMatch = /.*?(?<score>\d+) 👣/.exec(this.getResultLine(lines, 1));
      const steps = stepsMatch?.groups?.score 
        ? parseInt(stepsMatch.groups.score, 10) 
        : 9999;
      
      // Count health (green squares)
      const health = (this.getResultLine(lines, 3).match(/🟩/g) || []).length;
      
      // Count foes
      const foesLine = this.getResultLine(lines, 4).replace('⚔ ', '');
      const foes = Math.floor(foesLine.length / 2);
      
      // Count treasure
      const treasureLine = this.getResultLine(lines, 5).replace(/⬜/g, '');
      const treasure = Math.floor(treasureLine.length / 2);
      
      dailyResult.scores = [treasure, foes, steps, health];
    }
    
    return dailyResult;
  }
}
