import { ResultParser } from './base/result-parser';

// Import all parsers - order matters (same as C# Program.cs)
import { WordleParser } from './wordle-parser';
import { QuordleParser } from './quordle-parser';
import { WaffleParser } from './waffle-parser';
import { SquarewordParser } from './squareword-parser';
import { GlobleParser } from './globle-parser';
import { WorldleParser } from './worldle-parser';
import { TradleParser } from './tradle-parser';
import { TravleParser } from './travle-parser';
import { TimeGuessrParser } from './timeguessr-parser';
import { FoodGuessrParser } from './foodguessr-parser';
import { ConnectionsParser } from './connections-parser';
import { ColorfleParser } from './colorfle-parser';
import { ColorfleHardModeParser } from './colorfle-hardmode-parser';
import { NytMiniParser } from './nyt-mini-parser';
import { StrandsParser } from './strands-parser';
import { FramedParser } from './framed-parser';
import { FramequizParser } from './framequiz-parser';
import { MoviemojiParser } from './moviemoji-parser';
import { CloudleParser } from './cloudle-parser';
import { JuxtastatParser } from './juxtastat-parser';
import { KindaHardGolfParser } from './kindahardgolf-parser';
import { RoguleParser } from './rogule-parser';
import { BalatroParser } from './balatro-parser';
import { SlayTheSpireParser } from './slaythespire-parser';
import { DungleonParser } from './dungleon-parser';
import { CluesBySamParser } from './cluesbysam-parser';
import { MurdleParser } from './murdle-parser';
import { ThriceParser } from './thrice-parser';
import { CostcodleParser } from './costcodle-parser';
import { NytCrosswordParser } from './nyt-crossword-parser';
import { BracketCityParser } from './bracketcity-parser';
import { MinuteCrypticParser } from './minutecryptic-parser';
import { Crosswordle1Parser } from './crosswordle1-parser';
import { Crosswordle2Parser } from './crosswordle2-parser';
import { WeaverParser } from './weaver-parser';
import { RaddleParser } from './raddle-parser';
import { LewdleParser } from './lewdle-parser';
import { AntiwordleParser } from './antiwordle-parser';
import { AbsurdleParser } from './absurdle-parser';
import { BazingleParser } from './bazingle-parser';
import { BandleParser } from './bandle-parser';
import { BoxOfficeGameParser } from './boxofficegame-parser';
import { ActorleParser } from './actorle-parser';
import { Moviedle1Parser } from './moviedle1-parser';
import { Moviedle2Parser } from './moviedle2-parser';
import { ArtleParser } from './artle-parser';
import { NerdleParser } from './nerdle-parser';
import { SubwaydleParser } from './subwaydle-parser';
import { PoeltlParser } from './poeltl-parser';
import { HertlParser } from './hertl-parser';
import { SedecordleParser } from './sedecordle-parser';
import { SedecOrderParser } from './sedecorder-parser';
import { SedecordleSaviorParser } from './sedecordlesavior-parser';
import { ContextoParser } from './contexto-parser';
import { PimantleParser } from './pimantle-parser';
import { SemantleJuniorParser } from './semantlejunior-parser';
import { SemantleParser } from './semantle-parser';
import { RedactleParser } from './redactle-parser';

/**
 * All parsers in order (same order as C# backend)
 * Order matters - first match wins
 */
export function createParsers(): ResultParser[] {
  return [
    new WordleParser(),
    new QuordleParser(),
    new WaffleParser(),
    new SquarewordParser(),
    new GlobleParser(),
    new WorldleParser(),
    new TradleParser(),
    new TravleParser(),
    new TimeGuessrParser(),
    new FoodGuessrParser(),
    new ConnectionsParser(),
    new ColorfleParser(),
    new ColorfleHardModeParser(),
    new NytMiniParser(),
    new StrandsParser(),
    new FramedParser(),
    new FramequizParser(),
    new MoviemojiParser(),
    new CloudleParser(),
    new JuxtastatParser(),
    new KindaHardGolfParser(),
    new RoguleParser(),
    new BalatroParser(),
    new SlayTheSpireParser(),
    new DungleonParser(),
    new CluesBySamParser(),
    new MurdleParser(),
    new ThriceParser(),
    new CostcodleParser(),
    new NytCrosswordParser(),
    new BracketCityParser(),
    new MinuteCrypticParser(),
    new Crosswordle1Parser(),
    new Crosswordle2Parser(),
    new WeaverParser(),
    new RaddleParser(),
    new LewdleParser(),
    new AntiwordleParser(),
    new AbsurdleParser(),
    new BazingleParser(),
    new BandleParser(),
    new BoxOfficeGameParser(),
    new ActorleParser(),
    new Moviedle1Parser(),
    new Moviedle2Parser(),
    new ArtleParser(),
    new NerdleParser(),
    new SubwaydleParser(),
    new PoeltlParser(),
    new HertlParser(),
    new SedecordleParser(),
    new SedecOrderParser(),
    new SedecordleSaviorParser(),
    new ContextoParser(),
    new PimantleParser(),
    new SemantleJuniorParser(),
    new SemantleParser(),
    new RedactleParser(),
  ];
}

// Singleton instance of parsers
let parsersInstance: ResultParser[] | null = null;

export function getParsers(): ResultParser[] {
  if (!parsersInstance) {
    parsersInstance = createParsers();
  }
  return parsersInstance;
}

/**
 * Try to parse a result using all parsers
 * Returns the first successful parse, or null if no parser matches
 */
export function tryParseResult(user: string, date: string, result: string) {
  const parsers = getParsers();
  
  for (const parser of parsers) {
    const dailyResult = parser.tryParse(user, date, result);
    if (dailyResult) {
      return dailyResult;
    }
  }
  
  return null;
}

// Re-export base classes
export { ResultParser } from './base/result-parser';
export { BasicScoreResultParser } from './base/basic-score-parser';
export { BasicTimeResultParser } from './base/basic-time-parser';
