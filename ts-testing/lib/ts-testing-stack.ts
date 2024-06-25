import * as cdk from 'aws-cdk-lib';
import { Code, Runtime } from 'aws-cdk-lib/aws-lambda'
import { Construct } from 'constructs';

// let's put some very simple constructs to test
// lambda_layer_awscli, a bucket and a connection between them
export class TsSimpleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambda = new cdk.aws_lambda.Function(this, 'SimpleLambda', {
      code: Code.fromInline('console.log()'),
      handler: 'index.handler',
      runtime: Runtime.NODEJS_18_X
    })

    const bucket = new cdk.aws_s3.Bucket(this, 'SimpleBucket', {
      versioned: true
    });
    bucket.grantRead(lambda) // this will create the needed policy automatically
  }
}
