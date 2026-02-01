import { BasicTimeResultParser } from './base/basic-time-parser';

export class NytMiniParser extends BasicTimeResultParser {
  readonly countWinner = true;
  readonly gameName = 'NYT Mini';
  readonly helpText = 'Alternate entry: "Nytm 42", "Nytm 1:42", or "Nytm 1.42".';
  readonly url = 'https://www.nytimes.com/crosswords/game/mini';
  
  protected readonly parser = new RegExp(
    `(I solved the [\\d/]+ New York Times Mini Crossword in|NYTM) (?<${BasicTimeResultParser.TIME_GROUP}>[:\\d\\.]+)!?`,
    'i'
  );
}
