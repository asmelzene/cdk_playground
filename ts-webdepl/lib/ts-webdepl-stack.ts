import * as cdk from 'aws-cdk-lib';
import { Distribution, OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import { existsSync } from 'fs';
import { join } from 'path';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class TsWebdeplStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const deploymentBucket = new Bucket(this, 'TsWebDeploymentBucket')

    const uiDir = join(__dirname, '..', '..', 'web', 'dist');
    if (!existsSync(uiDir)) {
      console.warn('Ui dir not found: ' + uiDir);
    }
    
    const originIdentity = new OriginAccessIdentity(this, 'OriginAccessIdentity');
    deploymentBucket.grantRead(originIdentity)

    const distribution = new Distribution(this, 'WebDeploymentDistribution', {
        defaultRootObject: 'index.html',
        defaultBehavior: {
          origin: new S3Origin(deploymentBucket, {
            originAccessIdentity: originIdentity
          })
        }
    });

    new BucketDeployment(this, 'WebDeployment', {
      destinationBucket: deploymentBucket,
      sources: [Source.asset(uiDir)],
      distribution: distribution // this provides CloudFront not to use caching
      // without this, files in the distribution's edge caches will be invalidated 
      // after files are uploaded to the destination bucket
    });

    new cdk.CfnOutput(this, 'TsAppUrl', {
      value: distribution.distributionDomainName
    })
  }
}
