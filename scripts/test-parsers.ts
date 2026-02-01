/**
 * Parser comparison test using extracted test data
 * 
 * Compares TypeScript parser output against expected values from C# 
 * (stored in test-data.json, extracted from PostgreSQL)
 * 
 * Prerequisites:
 * - Run extract-test-data.ts first to generate test-data.json
 * 
 * Usage: 
 *   npx ts-node test-parsers.ts
 *   npx ts-node test-parsers.ts --game "Wordle"
 *   npx ts-node test-parsers.ts --verbose
 */

import * as fs from 'fs';
import * as path from 'path';

// Import the parser directly
import { tryParseResult } from '../lambdas/src/parsers';

interface TestDataItem {
  game: string;
  input: string;
  expectedScore?: number;
  expectedScores?: number[];
  expectedTime?: string;
  expectedCleanResult?: string;
  description: string;
}

const TEST_USER = '__parser_test__';
const TEST_DATE = '2020-01-01';

// Parse args
const args = process.argv.slice(2);
const gameIndex = args.indexOf('--game');
const gameFilter = gameIndex !== -1 ? args[gameIndex + 1] : null;
const verbose = args.includes('--verbose');

interface ParsedResult {
  game: string;
  score?: number;
  scores?: number[];
  time?: string;
  cleanResult: string;
}

// Run TS parser directly
function runTsParser(input: string): ParsedResult | null {
  try {
    const result = tryParseResult(TEST_USER, TEST_DATE, input);
    
    if (!result) {
      return null;
    }
    
    return {
      game: result.game,
      score: result.score,
      scores: result.scores,
      time: result.time,
      cleanResult: result.result, // The cleaned result text
    };
  } catch (error: any) {
    if (verbose) {
      console.error(`  TS parser error: ${error.message}`);
    }
    return null;
  }
}

function compareResults(ts: ParsedResult | null, expected: TestDataItem): string[] {
  const diffs: string[] = [];
  
  if (!ts) {
    diffs.push('TS failed to parse');
    return diffs;
  }
  
  // Compare game name
  if (ts.game !== expected.game) {
    diffs.push(`game: TS="${ts.game}", expected="${expected.game}"`);
  }
  
  // Compare score (null vs undefined normalization)
  const tsScore = ts.score ?? null;
  const expectedScore = expected.expectedScore ?? null;
  if (tsScore !== expectedScore) {
    diffs.push(`score: TS=${tsScore}, expected=${expectedScore}`);
  }
  
  // Compare scores array
  const tsScores = JSON.stringify(ts.scores ?? null);
  const expectedScores = JSON.stringify(expected.expectedScores ?? null);
  if (tsScores !== expectedScores) {
    diffs.push(`scores: TS=${tsScores}, expected=${expectedScores}`);
  }
  
  // Compare time
  const tsTime = ts.time ?? null;
  const expectedTime = expected.expectedTime ?? null;
  if (tsTime !== expectedTime) {
    diffs.push(`time: TS="${tsTime}", expected="${expectedTime}"`);
  }
  
  // Compare clean result (use expectedCleanResult if provided, otherwise input)
  const tsClean = ts.cleanResult;
  const expectedClean = expected.expectedCleanResult ?? expected.input;
  if (tsClean !== expectedClean) {
    diffs.push(`cleanResult differs (${tsClean.length} vs ${expectedClean.length} chars)`);
    if (verbose) {
      // Show first difference
      for (let i = 0; i < Math.max(tsClean.length, expectedClean.length); i++) {
        if (tsClean[i] !== expectedClean[i]) {
          diffs.push(`  First diff at char ${i}: TS="${tsClean.substring(i, i+20)}", expected="${expectedClean.substring(i, i+20)}"`);
          break;
        }
      }
    }
  }
  
  return diffs;
}

async function main(): Promise<void> {
  console.log('=== PARSER COMPARISON TEST ===\n');
  console.log('Comparing TypeScript parsers against expected values from C# (PostgreSQL)\n');
  if (gameFilter) {
    console.log(`Game filter: ${gameFilter}`);
  }
  
  // Load test data
  const testDataPath = path.join(__dirname, 'test-data.json');
  if (!fs.existsSync(testDataPath)) {
    console.error(`❌ test-data.json not found.`);
    console.error('   Run extract-test-data.ts first.\n');
    process.exit(1);
  }
  
  const allTestData: TestDataItem[] = JSON.parse(fs.readFileSync(testDataPath, 'utf-8'));
  const testData = gameFilter 
    ? allTestData.filter(t => t.game === gameFilter)
    : allTestData;
  
  console.log(`Loaded ${testData.length} test cases\n`);
  
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  const failures: { game: string; description: string; input: string; diffs: string[] }[] = [];
  const skippedGames = new Set<string>();
  
  let currentGame = '';
  
  for (const item of testData) {
    // Print game header
    if (item.game !== currentGame) {
      currentGame = item.game;
      console.log(`\n${currentGame}:`);
    }
    
    process.stdout.write(`  ${item.description.substring(0, 40).padEnd(42)} `);
    
    // Run TS parser
    const tsResult = runTsParser(item.input);
    
    // If TS couldn't parse, the game isn't re-parseable
    if (!tsResult) {
      console.log('⏭️  SKIP (not re-parseable)');
      skipped++;
      skippedGames.add(item.game);
      if (verbose) {
        console.log(`    Input: "${item.input.substring(0, 60).replace(/\n/g, '\\n')}..."`);
      }
      continue;
    }
    
    const diffs = compareResults(tsResult, item);
    
    if (diffs.length === 0) {
      console.log('✅ PASS');
      passed++;
    } else {
      console.log('❌ FAIL');
      failed++;
      failures.push({ game: item.game, description: item.description, input: item.input, diffs });
    }
  }
  
  console.log('\n\n=== SUMMARY ===');
  console.log(`Passed:  ${passed}`);
  console.log(`Failed:  ${failed}`);
  console.log(`Skipped: ${skipped}`);
  
  if (failures.length > 0) {
    console.log('\n=== FAILURES ===');
    for (const f of failures) {
      console.log(`\n${f.game} (${f.description}):`);
      f.diffs.forEach(d => console.log(`  ${d}`));
      if (verbose) {
        console.log(`  Input: "${f.input.substring(0, 100).replace(/\n/g, '\\n')}..."`);
      }
    }
  }
  
  if (skippedGames.size > 0) {
    console.log('\n=== GAMES NEEDING MANUAL TEST DATA ===');
    console.log('These games could not re-parse their cleaned results:');
    for (const g of Array.from(skippedGames).sort()) {
      console.log(`  - ${g}`);
    }
  }
  
  console.log('');
}

main().catch(console.error);

export {};
