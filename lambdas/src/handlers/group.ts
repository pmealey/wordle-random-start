import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { scanItems, DAILY_RESULTS_TABLE } from '../services/dynamodb-client';
import { DailyResult, GROUPS } from '../models/daily-result';
import { getNowEasternStandardTime, formatDateString, getDateDaysAgo } from '../utils/time-utility';
import { jsonResponse, errorResponse, notFoundResponse } from '../utils/response';
import { getParsers } from '../parsers';

/**
 * Lambda handler for GET /group/{name}
 * Returns group information with game popularity
 */
export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const groupName = event.pathParameters?.name;
    
    if (!groupName) {
      return errorResponse('Group name is required', 400);
    }
    
    const group = GROUPS.find(g => g.name === groupName);
    
    if (!group) {
      return notFoundResponse(`Group "${groupName}" not found`);
    }
    
    const now = getNowEasternStandardTime();
    const today = formatDateString(now);
    const lastWeekDate = getDateDaysAgo(7);
    const lastWeekDateString = formatDateString(lastWeekDate);
    
    // Get last week's results for this group
    const lastWeeksResults = await scanItems<DailyResult>(
      DAILY_RESULTS_TABLE,
      '#d <> :today AND #d >= :lastWeek AND contains(groups, :groupName)',
      {
        ':today': today,
        ':lastWeek': lastWeekDateString,
        ':groupName': groupName,
      },
      { '#d': 'date' }
    );
    
    const parsers = getParsers();
    
    // Calculate popularity for each game
    const popularity: Record<string, number> = {};
    for (const parser of parsers) {
      popularity[parser.gameName] = lastWeeksResults.filter(r => r.game === parser.gameName).length;
    }
    
    // Sort by popularity and get top games
    const seed = now.getFullYear() * 1000 + Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const rand = () => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    
    const allParsersByPopularity = parsers
      .filter(p => p.hideAfter > now && p.countWinner)
      .sort((a, b) => {
        const popDiff = (popularity[b.gameName] || 0) - (popularity[a.gameName] || 0);
        if (popDiff !== 0) return popDiff;
        return rand() - 0.5;
      });
    
    const mostPopularGames = new Set(allParsersByPopularity.slice(0, 6).map(p => p.gameName));
    
    // Build response
    const games: Record<string, { popularity: number; countWinner: boolean }> = {};
    for (const parser of parsers) {
      games[parser.gameName] = {
        popularity: popularity[parser.gameName] || 0,
        countWinner: mostPopularGames.has(parser.gameName),
      };
    }
    
    return jsonResponse({
      name: group.name,
      description: group.description,
      selectGames: group.selectGames,
      games,
    });
  } catch (error) {
    console.error('Error getting group:', error);
    return errorResponse('Internal server error', 500);
  }
}
