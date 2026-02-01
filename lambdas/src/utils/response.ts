import { APIGatewayProxyResult } from 'aws-lambda';

/**
 * Creates a successful JSON response
 */
export function jsonResponse(body: any, statusCode: number = 200): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    },
    body: JSON.stringify(body),
  };
}

/**
 * Creates an error response
 */
export function errorResponse(message: string, statusCode: number = 400): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    },
    body: message,
  };
}

/**
 * Creates a 404 Not Found response
 */
export function notFoundResponse(message: string = 'Not Found'): APIGatewayProxyResult {
  return errorResponse(message, 404);
}

/**
 * Creates a 204 No Content response
 */
export function noContentResponse(): APIGatewayProxyResult {
  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    },
    body: '',
  };
}

/**
 * Creates a CSV file download response
 */
export function csvResponse(content: string, filename: string): APIGatewayProxyResult {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    },
    body: content,
  };
}
