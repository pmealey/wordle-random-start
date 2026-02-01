import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import * as path from 'path';

export interface FrontendStackProps extends cdk.StackProps {
  stage: string;
  api: apigateway.RestApi;
}

export class FrontendStack extends cdk.Stack {
  public readonly distributionUrl: string;
  public readonly bucketName: string;

  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    const { stage, api } = props;

    // S3 bucket for frontend static files
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: `wordle-frontend-${stage}-${this.account}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: stage === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: stage !== 'prod',
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    // API Gateway origin for /api/wordle/* requests
    // Extract domain from API URL: https://abc123.execute-api.us-east-1.amazonaws.com/dev
    const apiDomain = `${api.restApiId}.execute-api.${this.region}.amazonaws.com`;
    const apiOrigin = new origins.HttpOrigin(apiDomain, {
      originPath: `/${stage}`, // The API Gateway stage
      protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
    });


    // Origin request policy for API - forward all query strings and headers
    const apiOriginRequestPolicy = new cloudfront.OriginRequestPolicy(this, 'ApiOriginRequestPolicy', {
      originRequestPolicyName: `wordle-api-origin-${stage}`,
      comment: 'Forward query strings to API Gateway',
      cookieBehavior: cloudfront.OriginRequestCookieBehavior.none(),
      headerBehavior: cloudfront.OriginRequestHeaderBehavior.allowList('Content-Type'),
      queryStringBehavior: cloudfront.OriginRequestQueryStringBehavior.all(),
    });

    // CloudFront Function to rewrite /api/wordle/* to /* for API Gateway
    const apiRewriteFunction = new cloudfront.Function(this, 'ApiRewriteFunction', {
      functionName: `wordle-api-rewrite-${stage}`,
      code: cloudfront.FunctionCode.fromInline(`
function handler(event) {
  var request = event.request;
  // Strip /api/wordle prefix from the URI
  request.uri = request.uri.replace(/^\\/api\\/wordle/, '');
  // Ensure URI starts with /
  if (!request.uri.startsWith('/')) {
    request.uri = '/' + request.uri;
  }
  return request;
}
      `),
    });

    // CloudFront distribution with Origin Access Control (newer API)
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      comment: `Wordle Frontend (${stage})`,
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(websiteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
      },
      additionalBehaviors: {
        '/api/wordle/*': {
          origin: apiOrigin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: apiOriginRequestPolicy,
          functionAssociations: [{
            function: apiRewriteFunction,
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
          }],
        },
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5),
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5),
        },
      ],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100, // Use only North America and Europe (cheapest)
    });

    // Deploy frontend files to S3
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset(path.join(__dirname, '../../frontend'))],
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ['/*'],
    });

    this.distributionUrl = `https://${distribution.distributionDomainName}`;
    this.bucketName = websiteBucket.bucketName;

    // Outputs
    new cdk.CfnOutput(this, 'DistributionUrl', {
      value: this.distributionUrl,
      description: 'CloudFront Distribution URL',
      exportName: `WordleFrontendUrl-${stage}`,
    });

    new cdk.CfnOutput(this, 'BucketName', {
      value: this.bucketName,
      description: 'S3 Bucket Name',
      exportName: `WordleFrontendBucket-${stage}`,
    });

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL (direct access)',
    });
  }
}
