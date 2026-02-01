# Daily Games AWS Infrastructure

This directory contains the AWS CDK infrastructure for the Daily Games (Wordle) application.

## Prerequisites

1. **AWS CLI** configured with credentials
2. **Node.js** 18.x or later
3. **AWS CDK CLI** installed globally: `npm install -g aws-cdk`

## Setup

```bash
# Install dependencies
cd infrastructure
npm install

# Bootstrap CDK (first time only, per account/region)
cdk bootstrap
```

## Deployment

### Deploy to Development

```bash
npm run deploy:dev

# Or with CDK directly:
cdk deploy --context stage=dev --all
```

### Deploy to Production

```bash
npm run deploy:prod

# Or with CDK directly:
cdk deploy --context stage=prod --all
```

## Architecture

The infrastructure consists of three stacks:

1. **DatabaseStack** - DynamoDB tables (DailyResults, DailyWords)
2. **ApiStack** - API Gateway + Lambda functions
3. **FrontendStack** - S3 bucket + CloudFront distribution

### Stack Dependencies

```
DatabaseStack → ApiStack → FrontendStack
```

## Useful Commands

```bash
# Show differences between deployed and local
npm run diff:dev
npm run diff:prod

# Synthesize CloudFormation templates
npm run synth:dev
npm run synth:prod

# Destroy stacks (careful!)
cdk destroy --context stage=dev --all
```

## Environment Variables

Lambda functions receive these environment variables:

- `STAGE` - dev or prod
- `DAILY_RESULTS_TABLE` - DynamoDB table name for results
- `DAILY_WORDS_TABLE` - DynamoDB table name for words

## Outputs

After deployment, you'll see outputs like:

- `WordleFrontend-{stage}.DistributionUrl` - CloudFront URL for frontend
- `WordleApi-{stage}.ApiUrl` - API Gateway URL

## Cost Estimate

For low traffic (~100 requests/day):

| Service | Monthly Cost |
|---------|-------------|
| S3 | ~$0.01 |
| CloudFront | Free tier |
| DynamoDB | ~$0.25 |
| API Gateway | ~$0.01 |
| Lambda | Free tier |
| **Total** | **~$0.50** |
