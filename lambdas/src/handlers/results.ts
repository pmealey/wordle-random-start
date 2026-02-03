import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { queryItems, scanItems, DAILY_RESULTS_TABLE } from '../services/dynamodb-client';
import { DailyResult, getGroupNames } from '../models/daily-result';
import { getNowEasternStandardTime, formatDateString } from '../utils/time-utility';
import { csvResponse, errorResponse } from '../utils/response';
import { getParsers } from '../parsers';

/**
 * Lambda handler for GET /results
 * Returns CSV export of results
 */
export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    // Decode query parameters since API Gateway passes them URL-encoded
    const namesParam = event.queryStringParameters?.names ? decodeURIComponent(event.queryStringParameters.names) : 'all';
    const excludeParam = event.queryStringParameters?.exclude ? decodeURIComponent(event.queryStringParameters.exclude) : '';
    const groupParam = event.queryStringParameters?.group ? decodeURIComponent(event.queryStringParameters.group) : undefined;
    
    // Parse parameters
    const excludedGames = excludeParam.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
    const allUsers = namesParam.toLowerCase() === 'all';
    const userList = allUsers ? [] : namesParam.toLowerCase().split('/').filter(Boolean);
    
    // Get all results (scanItems handles pagination internally)
    let results: DailyResult[];
    
    if (groupParam) {
      // Filter by group
      results = await scanItems<DailyResult>(
        DAILY_RESULTS_TABLE,
        'contains(groups, :group)',
        { ':group': groupParam.toLowerCase() }
      );
    } else {
      // Get all results
      results = await scanItems<DailyResult>(DAILY_RESULTS_TABLE);
    }
    
    // Filter by users if not "all"
    if (!allUsers) {
      results = results.filter(r => userList.includes(r.user.toLowerCase()));
    }
    
    // Get parsers and filter by excluded games
    const parsers = getParsers().filter(p => !excludedGames.includes(p.gameName.toLowerCase()));
    
    // Group results by date and user
    const grouped = new Map<string, DailyResult[]>();
    for (const result of results) {
      const key = `${result.date}|${result.user}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(result);
    }
    
    // Sort by date, then user
    const sortedKeys = Array.from(grouped.keys()).sort();
    
    // Build CSV
    const headerParts = ['Date', 'Player', ...parsers.map(p => `${p.gameName} Score`)];
    let csv = headerParts.join(',') + '\n';
    
    for (const key of sortedKeys) {
      const [date, user] = key.split('|');
      const userResults = grouped.get(key)!;
      
      const rowParts = [
        formatCsvDate(date),
        user,
      ];
      
      for (const parser of parsers) {
        const result = userResults.find(r => r.game === parser.gameName);
        if (result) {
          const scoreValue = parser.getScoreValue(result) || '';
          rowParts.push(scoreValue);
        } else {
          rowParts.push('');
        }
      }
      
      csv += rowParts.join(',') + '\n';
    }
    
    const now = formatDateString(getNowEasternStandardTime());
    return csvResponse(csv, `Results as of ${now}.csv`);
  } catch (error) {
    console.error('Error generating results CSV:', error);
    return errorResponse('Internal server error', 500);
  }
}

function formatCsvDate(dateString: string): string {
  // Convert YYYY-MM-DD to MM/DD/YYYY
  const [year, month, day] = dateString.split('-');
  return `${month}/${day}/${year}`;
}
