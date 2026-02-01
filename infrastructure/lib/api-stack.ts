import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import * as path from 'path';

// Helper to create log group for Lambda
function createLogGroup(scope: Construct, id: string, stage: string): logs.LogGroup {
  return new logs.LogGroup(scope, id, {
    // Let CDK generate the name to avoid conflicts with existing log groups
    retention: logs.RetentionDays.ONE_WEEK,
    removalPolicy: stage === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
  });
}

export interface ApiStackProps extends cdk.StackProps {
  stage: string;
  dailyResultsTable: dynamodb.Table;
  dailyWordsTable: dynamodb.Table;
}

export class ApiStack extends cdk.Stack {
  public readonly apiUrl: string;
  public readonly api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const { stage, dailyResultsTable, dailyWordsTable } = props;

    // Common Lambda configuration
    const lambdaEnvironment = {
      STAGE: stage,
      DAILY_RESULTS_TABLE: dailyResultsTable.tableName,
      DAILY_WORDS_TABLE: dailyWordsTable.tableName,
    };

    const commonLambdaProps: Partial<lambdaNodejs.NodejsFunctionProps> = {
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: lambdaEnvironment,
      bundling: {
        minify: true,
        sourceMap: true,
        externalModules: ['@aws-sdk/*'], // Use SDK v3 built into Lambda runtime
        forceDockerBundling: false, // Use local esbuild, not Docker
      },
    };

    // Lambda functions with explicit log groups
    const dailyWordHandler = new lambdaNodejs.NodejsFunction(this, 'DailyWordHandler', {
      ...commonLambdaProps,
      entry: path.join(__dirname, '../../lambdas/src/handlers/daily-word.ts'),
      functionName: `wordle-daily-word-${stage}`,
      description: 'Get the daily starting word',
      logGroup: createLogGroup(this, 'DailyWordLogGroup', stage),
      bundling: {
        ...commonLambdaProps.bundling,
        commandHooks: {
          beforeBundling(inputDir: string, outputDir: string): string[] {
            return [];
          },
          beforeInstall(inputDir: string, outputDir: string): string[] {
            return [];
          },
          afterBundling(inputDir: string, outputDir: string): string[] {
            // Copy the word list data file to the Lambda bundle
            // inputDir is the infrastructure folder, so go up one level to workspace root
            const isWindows = process.platform === 'win32';
            const srcPath = path.join(inputDir, '..', 'lambdas', 'src', 'data');
            const destPath = path.join(outputDir, 'data');
            if (isWindows) {
              return [`xcopy "${srcPath}" "${destPath}\\" /E /I /Y`];
            }
            return [`mkdir -p "${destPath}" && cp -r "${srcPath}"/* "${destPath}/"`];
          },
        },
      },
    });

    const gamesHandler = new lambdaNodejs.NodejsFunction(this, 'GamesHandler', {
      ...commonLambdaProps,
      entry: path.join(__dirname, '../../lambdas/src/handlers/games.ts'),
      functionName: `wordle-games-${stage}`,
      description: 'Get list of games',
      logGroup: createLogGroup(this, 'GamesLogGroup', stage),
    });

    const groupHandler = new lambdaNodejs.NodejsFunction(this, 'GroupHandler', {
      ...commonLambdaProps,
      entry: path.join(__dirname, '../../lambdas/src/handlers/group.ts'),
      functionName: `wordle-group-${stage}`,
      description: 'Get group information',
      logGroup: createLogGroup(this, 'GroupLogGroup', stage),
    });

    const dailyResultHandler = new lambdaNodejs.NodejsFunction(this, 'DailyResultHandler', {
      ...commonLambdaProps,
      entry: path.join(__dirname, '../../lambdas/src/handlers/daily-result.ts'),
      functionName: `wordle-daily-result-${stage}`,
      description: 'CRUD operations for daily results',
      logGroup: createLogGroup(this, 'DailyResultLogGroup', stage),
    });

    const resultsHandler = new lambdaNodejs.NodejsFunction(this, 'ResultsHandler', {
      ...commonLambdaProps,
      entry: path.join(__dirname, '../../lambdas/src/handlers/results.ts'),
      functionName: `wordle-results-${stage}`,
      description: 'CSV export of results',
      logGroup: createLogGroup(this, 'ResultsLogGroup', stage),
    });

    // Grant DynamoDB permissions to Lambda functions
    dailyWordsTable.grantReadWriteData(dailyWordHandler);
    dailyResultsTable.grantReadData(gamesHandler);
    dailyResultsTable.grantReadData(groupHandler);
    dailyResultsTable.grantReadWriteData(dailyResultHandler);
    dailyResultsTable.grantReadData(resultsHandler);

    // API Gateway
    const api = new apigateway.RestApi(this, 'WordleApi', {
      restApiName: `wordle-api-${stage}`,
      description: `Wordle Daily Games API (${stage})`,
      deployOptions: {
        stageName: stage,
        throttlingBurstLimit: 100,
        throttlingRateLimit: 50,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    // API Resources and Methods
    // GET /daily-word
    const dailyWordResource = api.root.addResource('daily-word');
    dailyWordResource.addMethod('GET', new apigateway.LambdaIntegration(dailyWordHandler));

    // GET /games
    // GET /games/{dateString}
    const gamesResource = api.root.addResource('games');
    gamesResource.addMethod('GET', new apigateway.LambdaIntegration(gamesHandler));
    const gamesDateResource = gamesResource.addResource('{dateString}');
    gamesDateResource.addMethod('GET', new apigateway.LambdaIntegration(gamesHandler));

    // GET /group/{name}
    const groupResource = api.root.addResource('group');
    const groupNameResource = groupResource.addResource('{name}');
    groupNameResource.addMethod('GET', new apigateway.LambdaIntegration(groupHandler));

    // /daily-result endpoints
    const dailyResultResource = api.root.addResource('daily-result');
    
    // GET /daily-result/{dateOrUser}
    // PUT /daily-result/{user}
    // DELETE /daily-result/{dateOrUser}
    const dailyResultParam1 = dailyResultResource.addResource('{param1}');
    dailyResultParam1.addMethod('GET', new apigateway.LambdaIntegration(dailyResultHandler));
    dailyResultParam1.addMethod('PUT', new apigateway.LambdaIntegration(dailyResultHandler));
    dailyResultParam1.addMethod('DELETE', new apigateway.LambdaIntegration(dailyResultHandler));

    // GET /daily-result/{user}/{date}
    // PUT /daily-result/{user}/{date}
    // DELETE /daily-result/{user}/{date}
    const dailyResultParam2 = dailyResultParam1.addResource('{param2}');
    dailyResultParam2.addMethod('GET', new apigateway.LambdaIntegration(dailyResultHandler));
    dailyResultParam2.addMethod('PUT', new apigateway.LambdaIntegration(dailyResultHandler));
    dailyResultParam2.addMethod('DELETE', new apigateway.LambdaIntegration(dailyResultHandler));

    // GET /daily-result/{user}/{date}/{game}
    const dailyResultParam3 = dailyResultParam2.addResource('{param3}');
    dailyResultParam3.addMethod('GET', new apigateway.LambdaIntegration(dailyResultHandler));

    // GET /results
    const resultsResource = api.root.addResource('results');
    resultsResource.addMethod('GET', new apigateway.LambdaIntegration(resultsHandler));
    const resultsGroupGame = resultsResource.addResource('{group}').addResource('{game}');
    resultsGroupGame.addMethod('GET', new apigateway.LambdaIntegration(resultsHandler));

    this.apiUrl = api.url;
    this.api = api;

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL',
      exportName: `WordleApiUrl-${stage}`,
    });

    new cdk.CfnOutput(this, 'ApiId', {
      value: api.restApiId,
      description: 'API Gateway ID',
      exportName: `WordleApiId-${stage}`,
    });
  }
}
