/**
 * Data Migration Script - Direct PostgreSQL to DynamoDB
 * 
 * Connects directly to your local PostgreSQL database and migrates to DynamoDB.
 * 
 * Usage:
 *   npx ts-node migrate-from-postgres.ts --stage dev
 *   npx ts-node migrate-from-postgres.ts --stage prod
 * 
 * Environment variables (or uses defaults for local wordle-backend):
 *   PG_HOST - PostgreSQL host (default: localhost)
 *   PG_PORT - PostgreSQL port (default: 5432)
 *   PG_USER - PostgreSQL user (default: wordle-backend)
 *   PG_PASSWORD - PostgreSQL password (default: 3ndB@ck)
 *   PG_DATABASE - PostgreSQL database (default: wordle-backend)
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, BatchWriteCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { Client } from 'pg';
import { v4 as uuidv4 } from 'uuid';

// Parse command line arguments
const args = process.argv.slice(2);
const stageIndex = args.indexOf('--stage');
const stage = stageIndex !== -1 && args[stageIndex + 1] ? args[stageIndex + 1] : 'dev';

console.log(`\n🚀 Migrating data to ${stage.toUpperCase()} environment\n`);

// PostgreSQL config (from appsettings.json defaults)
const pgConfig = {
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT || '5432', 10),
  user: process.env.PG_USER || 'wordle-backend',
  password: process.env.PG_PASSWORD || '3ndB@ck',
  database: process.env.PG_DATABASE || 'wordle-backend',
};

// DynamoDB setup
const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

const DAILY_RESULTS_TABLE = `DailyResults-${stage}`;
const DAILY_WORDS_TABLE = `DailyWords-${stage}`;

// Format date to YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Create userGame composite key
function createUserGameKey(user: string, game: string): string {
  return `${user.toLowerCase()}#${game}`;
}

// Batch write to DynamoDB with retry logic
async function batchWriteItems(tableName: string, items: any[]): Promise<number> {
  const batchSize = 25;
  let written = 0;
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(items.length / batchSize);
    
    try {
      await docClient.send(new BatchWriteCommand({
        RequestItems: {
          [tableName]: batch.map(item => ({
            PutRequest: { Item: item },
          })),
        },
      }));
      
      written += batch.length;
      process.stdout.write(`\r  Writing batch ${batchNum}/${totalBatches}... (${written}/${items.length})`);
    } catch (error: any) {
      console.error(`\n  ⚠️  Error in batch ${batchNum}:`, error.message);
      
      // Try individual writes as fallback
      for (const item of batch) {
        try {
          await docClient.send(new PutCommand({
            TableName: tableName,
            Item: item,
          }));
          written++;
        } catch (itemError: any) {
          console.error(`\n  ❌ Failed to write item:`, itemError.message);
        }
      }
    }
    
    // Small delay to avoid throttling
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(''); // New line after progress
  return written;
}

// Main migration function
async function migrate(): Promise<void> {
  const pgClient = new Client(pgConfig);
  
  try {
    // Connect to PostgreSQL
    console.log(`📦 Connecting to PostgreSQL at ${pgConfig.host}:${pgConfig.port}...`);
    await pgClient.connect();
    console.log('   ✅ Connected!\n');
    
    // Migrate DailyResult
    console.log('📊 Migrating DailyResult table...');
    const resultsQuery = await pgClient.query(`
      SELECT "Id", "User", "Date", "Game", "Result", "Score", "Time", "Scores", "Groups"
      FROM "DailyResult"
      ORDER BY "Date", "User", "Game"
    `);
    
    console.log(`   Found ${resultsQuery.rows.length} records`);
    
    const dailyResults = resultsQuery.rows.map(row => {
      // Parse scores array
      let scores: number[] | undefined;
      if (row.Scores && Array.isArray(row.Scores) && row.Scores.length > 0) {
        const parsed = row.Scores.map((s: any) => parseInt(s, 10)).filter((n: number) => !isNaN(n));
        scores = parsed.length > 0 ? parsed : undefined;
      }
      
      // Parse groups
      let groups = row.Groups;
      if (!groups || !Array.isArray(groups) || groups.length === 0) {
        groups = ['family'];
      }
      
      // Format time if present
      let time: string | undefined;
      if (row.Time) {
        // PostgreSQL interval to string - keys only exist if non-zero
        const t = row.Time;
        if (typeof t === 'object' && ('hours' in t || 'minutes' in t || 'seconds' in t)) {
          const h = t.hours || 0;
          const m = t.minutes || 0;
          const s = Math.floor(t.seconds || 0); // seconds can have decimals
          time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        } else if (typeof t === 'string') {
          time = t;
        }
      }
      
      return {
        date: formatDate(row.Date),
        userGame: createUserGameKey(row.User, row.Game),
        id: row.Id?.toString() || uuidv4(),
        user: row.User,
        game: row.Game,
        result: row.Result,
        score: row.Score !== null ? row.Score : undefined,
        time,
        scores,
        groups,
      };
    });
    
    const resultsWritten = await batchWriteItems(DAILY_RESULTS_TABLE, dailyResults);
    console.log(`   ✅ Migrated ${resultsWritten} records to ${DAILY_RESULTS_TABLE}\n`);
    
    // Migrate DailyWord
    console.log('📝 Migrating DailyWord table...');
    const wordsQuery = await pgClient.query(`
      SELECT "Date", "Word"
      FROM "DailyWord"
      ORDER BY "Date"
    `);
    
    console.log(`   Found ${wordsQuery.rows.length} records`);
    
    const dailyWords = wordsQuery.rows.map(row => ({
      date: formatDate(row.Date),
      word: row.Word,
    }));
    
    const wordsWritten = await batchWriteItems(DAILY_WORDS_TABLE, dailyWords);
    console.log(`   ✅ Migrated ${wordsWritten} records to ${DAILY_WORDS_TABLE}\n`);
    
    console.log('🎉 Migration complete!\n');
    
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    throw error;
  } finally {
    await pgClient.end();
  }
}

// Run migration
migrate().catch(() => process.exit(1));
