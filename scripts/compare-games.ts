/**
 * Script to compare game definitions between C# and TypeScript APIs
 * Usage: npx ts-node compare-games.ts
 */

interface Game {
  gameName: string;
  golfScoring: boolean;
  helpText: string | null;
  myPopularity: number;
  url: string | null;
}

const TS_API = 'https://d3stbuhxvfz6lh.cloudfront.net/api/wordle/games?user=Patrick';
const CSHARP_API = 'https://www.aureliansystems.io/api/wordle/games?user=Patrick';

async function fetchGames(url: string): Promise<Game[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.json() as Promise<Game[]>;
}

function compareGames(tsGames: Game[], csGames: Game[]): void {
  const tsMap = new Map(tsGames.map(g => [g.gameName, g]));
  const csMap = new Map(csGames.map(g => [g.gameName, g]));

  const allNames = new Set([...tsMap.keys(), ...csMap.keys()]);
  
  const differences: string[] = [];
  const missingInTs: string[] = [];
  const missingInCs: string[] = [];
  const extraInTs: string[] = [];

  for (const name of Array.from(allNames).sort()) {
    const tsGame = tsMap.get(name);
    const csGame = csMap.get(name);

    if (!tsGame && csGame) {
      missingInTs.push(name);
      continue;
    }
    if (tsGame && !csGame) {
      extraInTs.push(name);
      continue;
    }
    if (!tsGame || !csGame) continue;

    const diffs: string[] = [];

    if (tsGame.golfScoring !== csGame.golfScoring) {
      diffs.push(`  golfScoring: TS=${tsGame.golfScoring}, C#=${csGame.golfScoring}`);
    }
    if (tsGame.helpText !== csGame.helpText) {
      diffs.push(`  helpText: TS="${tsGame.helpText}", C#="${csGame.helpText}"`);
    }
    if (tsGame.url !== csGame.url) {
      diffs.push(`  url: TS="${tsGame.url}", C#="${csGame.url}"`);
    }
    // Skip myPopularity as it depends on user data

    if (diffs.length > 0) {
      differences.push(`${name}:\n${diffs.join('\n')}`);
    }
  }

  console.log('=== COMPARISON RESULTS ===\n');

  if (missingInTs.length > 0) {
    console.log('MISSING IN TYPESCRIPT (present in C#):');
    missingInTs.forEach(n => console.log(`  - ${n}`));
    console.log('');
  }

  if (extraInTs.length > 0) {
    console.log('EXTRA IN TYPESCRIPT (not in C#):');
    extraInTs.forEach(n => console.log(`  - ${n}`));
    console.log('');
  }

  if (differences.length > 0) {
    console.log('PROPERTY DIFFERENCES:');
    differences.forEach(d => console.log(d));
    console.log('');
  }

  if (missingInTs.length === 0 && extraInTs.length === 0 && differences.length === 0) {
    console.log('No differences found!');
  }

  console.log(`\nTotal: ${csGames.length} C# games, ${tsGames.length} TS games`);
}

async function main() {
  console.log('Fetching TypeScript API...');
  const tsGames = await fetchGames(TS_API);
  
  console.log('Fetching C# API...');
  const csGames = await fetchGames(CSHARP_API);
  
  compareGames(tsGames, csGames);
}

main().catch(console.error);

export {};
