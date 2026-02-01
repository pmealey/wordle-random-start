#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { FrontendStack } from '../lib/frontend-stack';
import { DatabaseStack } from '../lib/database-stack';
import { ApiStack } from '../lib/api-stack';

const app = new cdk.App();

// Get stage from context (dev or prod)
const stage = app.node.tryGetContext('stage') || 'dev';

if (stage !== 'dev' && stage !== 'prod') {
  throw new Error('Stage must be either "dev" or "prod"');
}

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
};

// Database stack (DynamoDB tables)
const databaseStack = new DatabaseStack(app, `WordleDatabase-${stage}`, {
  stage,
  env,
});

// API stack (API Gateway + Lambda functions)
const apiStack = new ApiStack(app, `WordleApi-${stage}`, {
  stage,
  dailyResultsTable: databaseStack.dailyResultsTable,
  dailyWordsTable: databaseStack.dailyWordsTable,
  env,
});
apiStack.addDependency(databaseStack);

// Frontend stack (S3 + CloudFront)
const frontendStack = new FrontendStack(app, `WordleFrontend-${stage}`, {
  stage,
  api: apiStack.api,
  env,
});
frontendStack.addDependency(apiStack);

// Add tags to all resources
cdk.Tags.of(app).add('Project', 'wordle-random-start');
cdk.Tags.of(app).add('Stage', stage);
