/**
 * Script to compare daily results between C# and TypeScript APIs
 * Usage: npx ts-node compare-results.ts [date]
 * Example: npx ts-node compare-results.ts 2025-01-30
 */

interface DailyResult {
  id: string;
  user: string;
  date: string;
  game: string;
  cleanResult: string;
  score?: number;
  scores?: number[];
  time?: string;
  groups?: string[];
}

const TS_API = 'https://d3stbuhxvfz6lh.cloudfront.net/api/wordle';
const CSHARP_API = 'https://www.aureliansystems.io/api/wordle';

async function fetchResults(baseUrl: string, date: string): Promise<DailyResult[]> {
  const url = `${baseUrl}/daily-result/${date}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.json() as Promise<DailyResult[]>;
}

function normalizeResult(r: DailyResult): DailyResult {
  return {
    ...r,
    // Normalize cleanResult whitespace for comparison
    cleanResult: r.cleanResult?.trim().replace(/\r\n/g, '\n') || '',
    // Sort scores array for consistent comparison
    scores: r.scores ? [...r.scores].sort((a, b) => a - b) : undefined,
  };
}

// Treat null and undefined as equivalent
function nullish(val: any): any {
  if (val === undefined || val === null || val === 'null') return null;
  return val;
}

function nullishEqual(a: any, b: any): boolean {
  return nullish(a) === nullish(b);
}

function compareResults(tsResults: DailyResult[], csResults: DailyResult[]): void {
  // Create maps by composite key (user + game)
  const tsMap = new Map(tsResults.map(r => [`${r.user}|${r.game}`, normalizeResult(r)]));
  const csMap = new Map(csResults.map(r => [`${r.user}|${r.game}`, normalizeResult(r)]));

  const allKeys = new Set([...tsMap.keys(), ...csMap.keys()]);
  
  const differences: string[] = [];
  const missingInTs: string[] = [];
  const missingInCs: string[] = [];

  for (const key of Array.from(allKeys).sort()) {
    const tsResult = tsMap.get(key);
    const csResult = csMap.get(key);

    if (!tsResult && csResult) {
      missingInTs.push(`${key} (game: ${csResult.game})`);
      continue;
    }
    if (tsResult && !csResult) {
      missingInCs.push(`${key} (game: ${tsResult.game})`);
      continue;
    }
    if (!tsResult || !csResult) continue;

    const diffs: string[] = [];

    // Compare score (null/undefined treated as equivalent)
    if (!nullishEqual(tsResult.score, csResult.score)) {
      diffs.push(`  score: TS=${tsResult.score ?? 'null'}, C#=${csResult.score ?? 'null'}`);
    }

    // Compare scores array (null/undefined treated as equivalent)
    const tsScores = nullish(tsResult.scores) ? JSON.stringify(tsResult.scores) : null;
    const csScores = nullish(csResult.scores) ? JSON.stringify(csResult.scores) : null;
    if (tsScores !== csScores) {
      diffs.push(`  scores: TS=${tsScores ?? 'null'}, C#=${csScores ?? 'null'}`);
    }

    // Compare time (null/undefined treated as equivalent)
    if (!nullishEqual(tsResult.time, csResult.time)) {
      diffs.push(`  time: TS="${tsResult.time ?? 'null'}", C#="${csResult.time ?? 'null'}"`);
    }

    // Compare cleanResult (just check if they differ, don't print full content)
    if (tsResult.cleanResult !== csResult.cleanResult) {
      diffs.push(`  cleanResult differs`);
      // Uncomment to see actual diff:
      // diffs.push(`    TS: "${tsResult.cleanResult.substring(0, 100)}..."`);
      // diffs.push(`    C#: "${csResult.cleanResult.substring(0, 100)}..."`);
    }

    if (diffs.length > 0) {
      differences.push(`${key}:\n${diffs.join('\n')}`);
    }
  }

  console.log('=== RESULTS COMPARISON ===\n');

  if (missingInTs.length > 0) {
    console.log('MISSING IN TYPESCRIPT (present in C#):');
    missingInTs.forEach(n => console.log(`  - ${n}`));
    console.log('');
  }

  if (missingInCs.length > 0) {
    console.log('MISSING IN C# (present in TypeScript):');
    missingInCs.forEach(n => console.log(`  - ${n}`));
    console.log('');
  }

  if (differences.length > 0) {
    console.log('VALUE DIFFERENCES:');
    differences.forEach(d => console.log(d));
    console.log('');
  }

  if (missingInTs.length === 0 && missingInCs.length === 0 && differences.length === 0) {
    console.log('✅ No differences found!');
  }

  console.log(`\nTotal: ${csResults.length} C# results, ${tsResults.length} TS results`);
}

async function main() {
  // Default to yesterday if no date provided
  const dateArg = process.argv[2];
  const date = dateArg || new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  console.log(`Comparing results for date: ${date}\n`);
  
  console.log('Fetching TypeScript API...');
  const tsResults = await fetchResults(TS_API, date);
  
  console.log('Fetching C# API...');
  const csResults = await fetchResults(CSHARP_API, date);
  
  compareResults(tsResults, csResults);
}

main().catch(console.error);

export {};
