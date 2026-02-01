/**
 * Extract test data from PostgreSQL
 * 
 * Fetches a variety of stored results (successes, failures, different scores)
 * and saves them to a JSON file for use in parser testing.
 * 
 * Usage: npx ts-node extract-test-data.ts [--samples N]
 * 
 * Output: test-data.json
 */

import { Client } from 'pg';
import * as fs from 'fs';

interface TestDataItem {
  game: string;
  input: string;       // The stored Result field
  expectedScore?: number;
  expectedScores?: number[];
  expectedTime?: string;
  description: string; // e.g., "success 4/6", "failure X/6"
}

// PostgreSQL config
const pgConfig = {
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT || '5432', 10),
  user: process.env.PG_USER || 'wordle-backend',
  password: process.env.PG_PASSWORD || '3ndB@ck',
  database: process.env.PG_DATABASE || 'wordle-backend',
};

// Parse args
const args = process.argv.slice(2);
const samplesIndex = args.indexOf('--samples');
const samplesPerGame = samplesIndex !== -1 ? parseInt(args[samplesIndex + 1], 10) : 3;

function formatTime(t: any): string | null {
  if (!t) return null;
  if (typeof t === 'string') return t;
  // PostgreSQL interval - keys only exist if non-zero
  if (typeof t === 'object' && ('hours' in t || 'minutes' in t || 'seconds' in t)) {
    const h = t.hours || 0;
    const m = t.minutes || 0;
    const s = Math.floor(t.seconds || 0); // seconds can have decimals
    if (h === 0 && m === 0 && s === 0) return null;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return null;
}

function describeResult(row: any): string {
  const parts: string[] = [];
  
  if (row.score !== null) {
    parts.push(`score=${row.score}`);
  }
  if (row.scores && row.scores.length > 0) {
    parts.push(`scores=[${row.scores.join(',')}]`);
  }
  if (row.time) {
    const t = formatTime(row.time);
    if (t) parts.push(`time=${t}`);
  }
  
  return parts.length > 0 ? parts.join(', ') : 'no score data';
}

async function main(): Promise<void> {
  console.log('=== EXTRACT TEST DATA ===\n');
  console.log(`PostgreSQL: ${pgConfig.host}:${pgConfig.port}/${pgConfig.database}`);
  console.log(`Samples per game: ${samplesPerGame}\n`);
  
  const pgClient = new Client(pgConfig);
  await pgClient.connect();
  console.log('✅ Connected to PostgreSQL\n');
  
  // Get list of all games
  const gamesResult = await pgClient.query(`
    SELECT DISTINCT "Game" as game, COUNT(*) as count
    FROM "DailyResult"
    GROUP BY "Game"
    ORDER BY "Game"
  `);
  
  console.log(`Found ${gamesResult.rows.length} unique games\n`);
  
  const testData: TestDataItem[] = [];
  
  for (const gameRow of gamesResult.rows) {
    const game = gameRow.game;
    process.stdout.write(`  ${game.padEnd(30)} `);
    
    // Get a variety of RECENT results for this game:
    // Prioritize most recent to minimize legacy data issues
    // - Most recent failure (NULL score)
    // - Most recent low score (success)
    // - Most recent high score (success)
    // All ordered by date DESC to get the newest data
    
    // Special handling for games that use Scores array instead of Score
    const usesScoresArray = ['Rogule', 'Quordle', 'Sedecordle', 'Balatro Daily Challenge', 'Contexto'];
    const isScoresGame = usesScoresArray.includes(game);
    
    let samplesQuery;
    if (isScoresGame) {
      // For games using Scores array, only get entries with Scores populated
      samplesQuery = await pgClient.query(`
        SELECT "Game" as game, "Result" as result, "Score" as score, 
               "Scores" as scores, "Time" as time, "Date" as date
        FROM "DailyResult"
        WHERE "Game" = $1 AND "Scores" IS NOT NULL
        ORDER BY "Date" DESC
        LIMIT 3
      `, [game]);
    } else {
      samplesQuery = await pgClient.query(`
        (
          SELECT "Game" as game, "Result" as result, "Score" as score, 
                 "Scores" as scores, "Time" as time, "Date" as date
          FROM "DailyResult"
          WHERE "Game" = $1 AND "Score" IS NULL
          ORDER BY "Date" DESC
          LIMIT 1
        )
        UNION ALL
        (
          SELECT * FROM (
            SELECT "Game" as game, "Result" as result, "Score" as score, 
                   "Scores" as scores, "Time" as time, "Date" as date
            FROM "DailyResult"
            WHERE "Game" = $1 AND "Score" IS NOT NULL
            ORDER BY "Date" DESC
            LIMIT 20
          ) recent_scores
          ORDER BY score ASC
          LIMIT 1
        )
        UNION ALL
        (
          SELECT * FROM (
            SELECT "Game" as game, "Result" as result, "Score" as score, 
                   "Scores" as scores, "Time" as time, "Date" as date
            FROM "DailyResult"
            WHERE "Game" = $1 AND "Score" IS NOT NULL
            ORDER BY "Date" DESC
            LIMIT 20
          ) recent_scores
          ORDER BY score DESC
          LIMIT 1
        )
      `, [game]);
    }
    
    // Deduplicate by result content
    const seen = new Set<string>();
    let added = 0;
    
    for (const row of samplesQuery.rows) {
      if (seen.has(row.result)) continue;
      if (added >= samplesPerGame) break;
      
      seen.add(row.result);
      added++;
      
      const item: TestDataItem = {
        game: row.game,
        input: row.result,
        description: describeResult(row),
      };
      
      if (row.score !== null) {
        item.expectedScore = row.score;
      }
      if (row.scores && row.scores.length > 0) {
        item.expectedScores = row.scores.map((s: any) => parseInt(s, 10));
      }
      const time = formatTime(row.time);
      if (time) {
        item.expectedTime = time;
      }
      
      testData.push(item);
    }
    
    console.log(`${added} samples`);
  }
  
  await pgClient.end();
  
  // Write to file
  const outputPath = 'test-data.json';
  fs.writeFileSync(outputPath, JSON.stringify(testData, null, 2));
  
  console.log(`\n✅ Wrote ${testData.length} test cases to ${outputPath}\n`);
}

main().catch(console.error);

export {};
