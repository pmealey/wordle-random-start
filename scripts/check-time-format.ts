/**
 * Quick script to check what format PostgreSQL returns for Time column
 */

import { Client } from 'pg';

async function main(): Promise<void> {
  const client = new Client({
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT || '5432', 10),
    user: process.env.PG_USER || 'wordle-backend',
    password: process.env.PG_PASSWORD || '3ndB@ck',
    database: process.env.PG_DATABASE || 'wordle-backend',
  });

  await client.connect();
  console.log('Connected to PostgreSQL\n');

  // Get a few rows with Time values
  const result = await client.query(`
    SELECT "Game", "Result", "Time", "Score" 
    FROM "DailyResult" 
    WHERE "Time" IS NOT NULL 
    LIMIT 5
  `);

  console.log(`Found ${result.rows.length} rows with Time values:\n`);
  
  for (const row of result.rows) {
    console.log('Game:', row.Game);
    console.log('Score:', row.Score);
    console.log('Time value:', row.Time);
    console.log('Time type:', typeof row.Time);
    console.log('Time keys:', row.Time && typeof row.Time === 'object' ? Object.keys(row.Time) : 'N/A');
    console.log('Time JSON:', JSON.stringify(row.Time));
    console.log('---');
  }

  await client.end();
}

main().catch(console.error);

export {};
