import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { scanItems, DAILY_RESULTS_TABLE } from '../services/dynamodb-client';
import { DailyResult } from '../models/daily-result';
import { getNowEasternStandardTime, formatDateString, getDateDaysAgo } from '../utils/time-utility';
import { jsonResponse, errorResponse } from '../utils/response';
import { getParsers } from '../parsers';

/**
 * Lambda handler for GET /games and GET /games/{dateString}
 * Returns list of available games with metadata including user's play history
 */
export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const user = event.queryStringParameters?.user || '';
    const now = getNowEasternStandardTime();
    const today = formatDateString(now);
    
    // Get last week's date for popularity calculation
    const lastWeekDate = getDateDaysAgo(7);
    const lastWeekDateString = formatDateString(lastWeekDate);
    
    // Scan for last week's results (excluding today)
    // Filter: date != today AND date >= lastWeek
    const lastWeeksResults = await scanItems<DailyResult>(
      DAILY_RESULTS_TABLE,
      '#d <> :today AND #d >= :lastWeek',
      {
        ':today': today,
        ':lastWeek': lastWeekDateString,
      },
      { '#d': 'date' }
    );
    
    // Filter results for this specific user
    const userResults = user ? lastWeeksResults.filter(r => r.user === user) : [];
    
    // Count games played by this user in the last week
    const userGameCounts: Record<string, number> = {};
    for (const result of userResults) {
      userGameCounts[result.game] = (userGameCounts[result.game] || 0) + 1;
    }
    
    const parsers = getParsers();
    
    // Filter parsers that should still be shown
    const visibleParsers = parsers.filter(p => p.hideAfter > now);
    
    const games = visibleParsers.map(parser => ({
      gameName: parser.gameName,
      golfScoring: parser.golfScoring,
      helpText: parser.helpText,
      myPopularity: userGameCounts[parser.gameName] || 0,
      url: parser.url,
    }));
    
    return jsonResponse(games);
  } catch (error) {
    console.error('Error getting games:', error);
    return errorResponse('Internal server error', 500);
  }
}
