import { SemantleParser } from './semantle-parser';

export class SemantleJuniorParser extends SemantleParser {
  override readonly gameName = 'Semantle Junior';
  override readonly url = 'https://semantle.com/junior';
  
  // Override the regex to match "Semantle Junior" specifically
  protected override readonly parser = new RegExp(
    `Semantle Junior #\\d+.*?(?<completed>✅|❌).*?(?<score>\\d+) Guesse?s?.*?💡 (?<hints>\\d+) Hints?`,
    's'
  );
}
