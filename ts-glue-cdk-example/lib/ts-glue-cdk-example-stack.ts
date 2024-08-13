import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as glue from 'aws-cdk-lib/aws-glue';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class GlueJobStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create an S3 bucket
    const bucket = new s3.Bucket(this, 'MyGlueJobBucket');

    // Upload the script and wheel file to the S3 bucket
    new s3deploy.BucketDeployment(this, 'DeployGlueAssets', {
      sources: [
        s3deploy.Source.asset('scripts'), // path/to/local/scripts
        s3deploy.Source.asset('wheel_libs'),    // path/to/local/libs (which contains the .whl file)
      ],
      destinationBucket: bucket,
      // destinationKeyPrefix: 'scripts/',
      destinationKeyPrefix: '', // no prefix needed to deploy at the root level
    });

    // Create an IAM role for the Glue job
    const role = new iam.Role(this, 'GlueJobRole', {
      assumedBy: new iam.ServicePrincipal('glue.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSGlueServiceRole'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AWSGlueConsoleFullAccess'), // Example: Attach additional policies
      ],
    });

    // Optionally, add inline policies
    role.addToPolicy(new iam.PolicyStatement({
      actions: [
        's3:GetObject',
        's3:ListBucket',
      ],
      resources: [
        `arn:aws:s3:::${bucket.bucketName}`,
        `arn:aws:s3:::${bucket.bucketName}/*`,
      ],
    }));

    // Create the Glue job using JobProps
    const glueJob = new glue.CfnJob(this, 'GlueJob', {
      role: role.roleArn,
      command: {
        name: 'glueetl',
        scriptLocation: `s3://${bucket.bucketName}/scripts/test-script.py`,
        pythonVersion: '3',
      },
      glueVersion: '3.0',
      defaultArguments: {
        '--job-language': 'python',
        '--extra-py-files': `s3://${bucket.bucketName}/libs/my_glue_package-0.1-py3-none-any.whl`, // Reference to the wheel file
      },
    });

    // Grant Glue job permissions to read the script
    bucket.grantRead(role);
  }
}
