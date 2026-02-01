import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  GetCommand, 
  PutCommand, 
  DeleteCommand, 
  QueryCommand,
  ScanCommand,
  BatchWriteCommand,
  GetCommandInput,
  PutCommandInput,
  DeleteCommandInput,
  QueryCommandInput,
  ScanCommandInput,
  BatchWriteCommandInput
} from '@aws-sdk/lib-dynamodb';

// Create DynamoDB client
const client = new DynamoDBClient({});

// Create document client with marshalling options
export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    convertEmptyValues: false,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
});

// Table names from environment variables
export const DAILY_RESULTS_TABLE = process.env.DAILY_RESULTS_TABLE || 'DailyResults-dev';
export const DAILY_WORDS_TABLE = process.env.DAILY_WORDS_TABLE || 'DailyWords-dev';

// Helper functions for common operations
export async function getItem<T>(tableName: string, key: Record<string, any>): Promise<T | null> {
  const params: GetCommandInput = {
    TableName: tableName,
    Key: key,
  };
  
  const result = await docClient.send(new GetCommand(params));
  return (result.Item as T) || null;
}

export async function putItem(tableName: string, item: Record<string, any>): Promise<void> {
  const params: PutCommandInput = {
    TableName: tableName,
    Item: item,
  };
  
  await docClient.send(new PutCommand(params));
}

export async function deleteItem(tableName: string, key: Record<string, any>): Promise<void> {
  const params: DeleteCommandInput = {
    TableName: tableName,
    Key: key,
  };
  
  await docClient.send(new DeleteCommand(params));
}

export async function queryItems<T>(
  tableName: string,
  keyConditionExpression: string,
  expressionAttributeValues: Record<string, any>,
  expressionAttributeNames?: Record<string, string>,
  indexName?: string,
  filterExpression?: string
): Promise<T[]> {
  const allItems: T[] = [];
  let lastEvaluatedKey: Record<string, any> | undefined;
  
  do {
    const params: QueryCommandInput = {
      TableName: tableName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ExclusiveStartKey: lastEvaluatedKey,
    };
    
    if (expressionAttributeNames) {
      params.ExpressionAttributeNames = expressionAttributeNames;
    }
    
    if (indexName) {
      params.IndexName = indexName;
    }
    
    if (filterExpression) {
      params.FilterExpression = filterExpression;
    }
    
    const result = await docClient.send(new QueryCommand(params));
    
    if (result.Items) {
      allItems.push(...(result.Items as T[]));
    }
    
    lastEvaluatedKey = result.LastEvaluatedKey;
  } while (lastEvaluatedKey);
  
  return allItems;
}

export async function scanItems<T>(
  tableName: string,
  filterExpression?: string,
  expressionAttributeValues?: Record<string, any>,
  expressionAttributeNames?: Record<string, string>
): Promise<T[]> {
  const allItems: T[] = [];
  let lastEvaluatedKey: Record<string, any> | undefined;
  
  do {
    const params: ScanCommandInput = {
      TableName: tableName,
      ExclusiveStartKey: lastEvaluatedKey,
    };
    
    if (filterExpression) {
      params.FilterExpression = filterExpression;
    }
    
    if (expressionAttributeValues) {
      params.ExpressionAttributeValues = expressionAttributeValues;
    }
    
    if (expressionAttributeNames) {
      params.ExpressionAttributeNames = expressionAttributeNames;
    }
    
    const result = await docClient.send(new ScanCommand(params));
    
    if (result.Items) {
      allItems.push(...(result.Items as T[]));
    }
    
    lastEvaluatedKey = result.LastEvaluatedKey;
  } while (lastEvaluatedKey);
  
  return allItems;
}

export async function batchWrite(
  tableName: string,
  items: Record<string, any>[]
): Promise<void> {
  // DynamoDB batch write limit is 25 items
  const batchSize = 25;
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const params: BatchWriteCommandInput = {
      RequestItems: {
        [tableName]: batch.map(item => ({
          PutRequest: {
            Item: item,
          },
        })),
      },
    };
    
    await docClient.send(new BatchWriteCommand(params));
  }
}
