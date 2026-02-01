import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export interface DatabaseStackProps extends cdk.StackProps {
  stage: string;
}

export class DatabaseStack extends cdk.Stack {
  public readonly dailyResultsTable: dynamodb.Table;
  public readonly dailyWordsTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props);

    const { stage } = props;

    // DailyResults table
    // Partition key: date (YYYY-MM-DD)
    // Sort key: user#game (allows querying by user and game within a date)
    this.dailyResultsTable = new dynamodb.Table(this, 'DailyResultsTable', {
      tableName: `DailyResults-${stage}`,
      partitionKey: {
        name: 'date',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'userGame',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // On-demand pricing for low cost
      removalPolicy: stage === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      pointInTimeRecoverySpecification: stage === 'prod' ? { pointInTimeRecoveryEnabled: true } : undefined,
    });

    // Global Secondary Index for querying by user across all dates
    this.dailyResultsTable.addGlobalSecondaryIndex({
      indexName: 'UserIndex',
      partitionKey: {
        name: 'user',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'date',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Global Secondary Index for querying by ID (for delete by ID)
    this.dailyResultsTable.addGlobalSecondaryIndex({
      indexName: 'IdIndex',
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // DailyWords table
    // Partition key: date (YYYY-MM-DD)
    this.dailyWordsTable = new dynamodb.Table(this, 'DailyWordsTable', {
      tableName: `DailyWords-${stage}`,
      partitionKey: {
        name: 'date',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: stage === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });

    // Outputs
    new cdk.CfnOutput(this, 'DailyResultsTableName', {
      value: this.dailyResultsTable.tableName,
      description: 'DailyResults DynamoDB Table Name',
      exportName: `DailyResultsTable-${stage}`,
    });

    new cdk.CfnOutput(this, 'DailyResultsTableArn', {
      value: this.dailyResultsTable.tableArn,
      description: 'DailyResults DynamoDB Table ARN',
      exportName: `DailyResultsTableArn-${stage}`,
    });

    new cdk.CfnOutput(this, 'DailyWordsTableName', {
      value: this.dailyWordsTable.tableName,
      description: 'DailyWords DynamoDB Table Name',
      exportName: `DailyWordsTable-${stage}`,
    });

    new cdk.CfnOutput(this, 'DailyWordsTableArn', {
      value: this.dailyWordsTable.tableArn,
      description: 'DailyWords DynamoDB Table ARN',
      exportName: `DailyWordsTableArn-${stage}`,
    });
  }
}
