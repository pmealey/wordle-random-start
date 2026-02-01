/**
 * Quick script to test getting a random daily word using the TypeScript handler logic
 */

import * as fs from 'fs';
import * as path from 'path';

// Load word list from the lambdas data folder
function getWordList(): string[] {
  const wordPath = path.join(__dirname, '..', 'lambdas', 'src', 'data', 'combined.txt');
  
  if (!fs.existsSync(wordPath)) {
    throw new Error(`Word list not found at: ${wordPath}`);
  }
  
  const content = fs.readFileSync(wordPath, 'utf-8');
  const words = content.split('\n').map(w => w.trim().toUpperCase()).filter(w => w.length === 5);
  console.log(`Loaded ${words.length} words from ${wordPath}\n`);
  return words;
}

/**
 * Simple LCG (Linear Congruential Generator) for seeded randomness
 * Same implementation as in daily-word.ts handler
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
function getWordForDate(words: string[], date: Date): string {
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const rand = seededRandom(seed);
  const index = Math.floor(rand() * words.length);
  return words[index];
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function main(): Promise<void> {
  console.log('=== Daily Word Test ===\n');
  
  const words = getWordList();
  
  // Get today's word
  const today = new Date();
  const todayWord = getWordForDate(words, today);
  console.log(`Today (${formatDate(today)}): ${todayWord}`);
  
  // Get tomorrow's word
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowWord = getWordForDate(words, tomorrow);
  console.log(`Tomorrow (${formatDate(tomorrow)}): ${tomorrowWord}`);
  
  // Get yesterday's word
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayWord = getWordForDate(words, yesterday);
  console.log(`Yesterday (${formatDate(yesterday)}): ${yesterdayWord}`);
  
  console.log('\n--- Next 7 Days ---');
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const word = getWordForDate(words, date);
    console.log(`${formatDate(date)}: ${word}`);
  }
  
  // Verify determinism - same date should always give same word
  console.log('\n--- Determinism Check ---');
  const testDate = new Date(2026, 1, 1); // Feb 1, 2026
  const word1 = getWordForDate(words, testDate);
  const word2 = getWordForDate(words, testDate);
  console.log(`Feb 1, 2026 (attempt 1): ${word1}`);
  console.log(`Feb 1, 2026 (attempt 2): ${word2}`);
  console.log(`Deterministic: ${word1 === word2 ? 'YES ✓' : 'NO ✗'}`);
}

main().catch(console.error);

export {};
