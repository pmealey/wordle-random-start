import { BasicTimeResultParser } from './base/basic-time-parser';

export class NytCrosswordParser extends BasicTimeResultParser {
  readonly countWinner = false;
  readonly gameName = 'NYT Crossword';
  readonly helpText = 'Alternate entry: "Nytc 42:42", "Nytc 42.42", or "Nytc 1:42:42".';
  readonly url = null;
  
  protected readonly parser = new RegExp(
    `(I solved the (Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday) [\\d/]+ New York Times Daily Crossword in|NYTC) (?<${BasicTimeResultParser.TIME_GROUP}>[:\\d\\.]+)`,
    'i'
  );
}
