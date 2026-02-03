import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { 
  getItem, 
  putItem, 
  deleteItem, 
  queryItems, 
  scanItems,
  DAILY_RESULTS_TABLE 
} from '../services/dynamodb-client';
import { DailyResult, createUserGameKey, validateGroups, getGroupNames } from '../models/daily-result';
import { getTodayDateString, parseDate, formatDateString, isValidDate } from '../utils/time-utility';
import { jsonResponse, errorResponse, notFoundResponse, noContentResponse } from '../utils/response';
import { tryParseResult } from '../parsers';

/**
 * Lambda handler for /daily-result endpoints
 * Handles GET, PUT, DELETE with various path parameters
 */
export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const method = event.httpMethod;
  // Decode path parameters since API Gateway passes them URL-encoded
  const param1 = event.pathParameters?.param1 ? decodeURIComponent(event.pathParameters.param1) : undefined;
  const param2 = event.pathParameters?.param2 ? decodeURIComponent(event.pathParameters.param2) : undefined;
  const param3 = event.pathParameters?.param3 ? decodeURIComponent(event.pathParameters.param3) : undefined;
  
  try {
    switch (method) {
      case 'GET':
        return handleGet(param1, param2, param3, event);
      case 'PUT':
        return handlePut(param1, param2, event);
      case 'DELETE':
        return handleDelete(param1, param2, event);
      default:
        return errorResponse('Method not allowed', 405);
    }
  } catch (error) {
    console.error('Error in daily-result handler:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * GET /daily-result/{param1}
 * GET /daily-result/{param1}/{param2}
 * GET /daily-result/{param1}/{param2}/{param3}
 */
async function handleGet(
  param1?: string, 
  param2?: string, 
  param3?: string,
  event?: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  // GET by numeric ID
  if (param1 && /^\d+$/.test(param1)) {
    const result = await queryItems<DailyResult>(
      DAILY_RESULTS_TABLE,
      'id = :id',
      { ':id': param1 },
      undefined,
      'IdIndex'
    );
    
    if (result.length === 0) {
      return notFoundResponse();
    }
    
    return jsonResponse(result[0]);
  }
  
  // Parse groups from query params
  const groups = event?.multiValueQueryStringParameters?.group || [];
  const validGroups = groups.length > 0 ? groups : ['family'];
  
  // Validate groups
  const validation = validateGroups(validGroups);
  if (!validation.valid) {
    return errorResponse(`Invalid groups: ${validation.invalid.join(', ')}`, 400);
  }
  
  // GET /daily-result/{dateOrUser}
  if (param1 && !param2) {
    const isDate = isValidDate(param1);
    
    if (isDate) {
      // Get results for a specific date
      const results = await queryItems<DailyResult>(
        DAILY_RESULTS_TABLE,
        '#d = :date',
        { ':date': param1 },
        { '#d': 'date' }
      );
      
      // Filter by groups
      const filtered = results.filter(r => 
        r.groups.some(g => validGroups.includes(g))
      );
      
      return jsonResponse(filtered.sort((a, b) => {
        if (a.game !== b.game) return a.game.localeCompare(b.game);
        return a.user.localeCompare(b.user);
      }));
    } else {
      // Get results for a specific user
      const results = await queryItems<DailyResult>(
        DAILY_RESULTS_TABLE,
        '#u = :user',
        { ':user': param1.toLowerCase() },
        { '#u': 'user' },
        'UserIndex'
      );
      
      // Filter by groups
      const filtered = results.filter(r => 
        r.groups.some(g => validGroups.includes(g))
      );
      
      return jsonResponse(filtered.sort((a, b) => {
        if (a.game !== b.game) return a.game.localeCompare(b.game);
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.user.localeCompare(b.user);
      }));
    }
  }
  
  // GET /daily-result/{user}/{date}
  if (param1 && param2 && !param3) {
    const user = param1.toLowerCase();
    const date = param2;
    
    if (!isValidDate(date)) {
      return errorResponse('Invalid date', 400);
    }
    
    const results = await queryItems<DailyResult>(
      DAILY_RESULTS_TABLE,
      '#d = :date',
      { ':date': date },
      { '#d': 'date' }
    );
    
    const filtered = results.filter(r => r.user.toLowerCase() === user);
    return jsonResponse(filtered);
  }
  
  // GET /daily-result/{user}/{date}/{game}
  if (param1 && param2 && param3) {
    const user = param1.toLowerCase();
    const date = param2;
    const game = param3;
    
    if (!isValidDate(date)) {
      return errorResponse('Invalid date', 400);
    }
    
    const userGameKey = createUserGameKey(user, game);
    const result = await getItem<DailyResult>(DAILY_RESULTS_TABLE, {
      date,
      userGame: userGameKey,
    });
    
    if (!result) {
      return notFoundResponse();
    }
    
    return jsonResponse(result);
  }
  
  return errorResponse('Invalid request', 400);
}

/**
 * PUT /daily-result/{user}
 * PUT /daily-result/{user}/{date}
 */
async function handlePut(
  param1?: string,
  param2?: string,
  event?: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  if (!param1) {
    return errorResponse('User is required', 400);
  }
  
  const user = param1;
  const date = param2 && isValidDate(param2) ? param2 : getTodayDateString();
  
  // Parse result from body
  let resultText: string;
  try {
    resultText = JSON.parse(event?.body || '""');
  } catch {
    return errorResponse('Invalid request body', 400);
  }
  
  if (!resultText || typeof resultText !== 'string') {
    return errorResponse('Result text is required', 400);
  }
  
  // Parse groups from query params
  const groups = event?.multiValueQueryStringParameters?.group || ['family'];
  
  // Validate groups
  const validation = validateGroups(groups);
  if (!validation.valid) {
    return errorResponse(`Invalid groups: ${validation.invalid.join(', ')}`, 400);
  }
  
  // Try to parse the result
  const dailyResult = tryParseResult(user, date, resultText);
  
  if (!dailyResult) {
    return errorResponse('The game results could not be parsed.', 400);
  }
  
  // Set groups
  dailyResult.groups = groups;
  
  // Check for existing result
  const existing = await getItem<DailyResult>(DAILY_RESULTS_TABLE, {
    date: dailyResult.date,
    userGame: dailyResult.userGame,
  });
  
  if (existing) {
    // Update existing - keep the same ID
    dailyResult.id = existing.id;
  }
  
  // Save to DynamoDB
  await putItem(DAILY_RESULTS_TABLE, dailyResult);
  
  return noContentResponse();
}

/**
 * DELETE /daily-result/{id}
 * DELETE /daily-result/{user}
 * DELETE /daily-result/{user}/{date}
 */
async function handleDelete(
  param1?: string,
  param2?: string,
  event?: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  if (!param1) {
    return errorResponse('Parameter is required', 400);
  }
  
  // DELETE by numeric ID
  if (/^\d+$/.test(param1)) {
    // Find the item by ID first (need the partition/sort key to delete)
    const results = await queryItems<DailyResult>(
      DAILY_RESULTS_TABLE,
      'id = :id',
      { ':id': param1 },
      undefined,
      'IdIndex'
    );
    
    if (results.length > 0) {
      await deleteItem(DAILY_RESULTS_TABLE, {
        date: results[0].date,
        userGame: results[0].userGame,
      });
    }
    
    return noContentResponse();
  }
  
  const user = param1.toLowerCase();
  
  // DELETE /daily-result/{user} - delete all for user
  if (!param2) {
    const results = await queryItems<DailyResult>(
      DAILY_RESULTS_TABLE,
      '#u = :user',
      { ':user': user },
      { '#u': 'user' },
      'UserIndex'
    );
    
    for (const result of results) {
      await deleteItem(DAILY_RESULTS_TABLE, {
        date: result.date,
        userGame: result.userGame,
      });
    }
    
    return noContentResponse();
  }
  
  // DELETE /daily-result/{user}/{date}
  if (!isValidDate(param2)) {
    return errorResponse('Invalid date', 400);
  }
  
  const results = await queryItems<DailyResult>(
    DAILY_RESULTS_TABLE,
    '#d = :date',
    { ':date': param2 },
    { '#d': 'date' }
  );
  
  const toDelete = results.filter(r => r.user.toLowerCase() === user);
  
  for (const result of toDelete) {
    await deleteItem(DAILY_RESULTS_TABLE, {
      date: result.date,
      userGame: result.userGame,
    });
  }
  
  return noContentResponse();
}
