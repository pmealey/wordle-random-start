import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getItem, putItem, DAILY_WORDS_TABLE } from '../services/dynamodb-client';
import { DailyWord } from '../models/daily-result';
import { getTodayDateString, formatDateString, getNowEasternStandardTime } from '../utils/time-utility';
import { jsonResponse, errorResponse } from '../utils/response';
import * as fs from 'fs';
import * as path from 'path';

// Load word list from bundled file (cached in memory between Lambda invocations)
let DAILY_WORDS: string[] | null = null;

function getWordList(): string[] {
  if (DAILY_WORDS === null) {
    // Try multiple possible paths (Lambda environment vs local dev)
    const possiblePaths = [
      path.join(__dirname, 'data', 'combined.txt'),
      path.join(__dirname, '..', 'data', 'combined.txt'),
      path.join(process.cwd(), 'data', 'combined.txt'),
    ];
    
    for (const wordPath of possiblePaths) {
      if (fs.existsSync(wordPath)) {
        const content = fs.readFileSync(wordPath, 'utf-8');
        DAILY_WORDS = content.split('\n').map(w => w.trim().toUpperCase()).filter(w => w.length === 5);
        console.log(`Loaded ${DAILY_WORDS.length} words from ${wordPath}`);
        break;
      }
    }
    
    if (DAILY_WORDS === null) {
      console.error('Could not find word list file');
      throw new Error('DICTIONARY NOT FOUND');
    }
  }
  return DAILY_WORDS;
}

/**
 * Simple LCG (Linear Congruential Generator) for seeded randomness
 */
function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

/**
 * Gets a seeded random word for a given date
 */
function getWordForDate(date: Date): string {
  const words = getWordList();
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const rand = seededRandom(seed);
  const index = Math.floor(rand() * words.length);
  return words[index];
}

/**
 * Lambda handler for GET /daily-word
 * Returns today's daily starting word
 */
export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const today = getNowEasternStandardTime();
    const dateString = formatDateString(today);
    
    // Try to get from DynamoDB first
    let dailyWord = await getItem<DailyWord>(DAILY_WORDS_TABLE, { date: dateString });
    
    if (!dailyWord) {
      // Generate and store the word for today
      const word = getWordForDate(today);
      dailyWord = { date: dateString, word };
      
      await putItem(DAILY_WORDS_TABLE, dailyWord);
    }
    
    return jsonResponse({
      date: dailyWord.date,
      word: dailyWord.word,
    });
  } catch (error) {
    console.error('Error getting daily word:', error);
    return errorResponse('Internal server error', 500);
  }
}
