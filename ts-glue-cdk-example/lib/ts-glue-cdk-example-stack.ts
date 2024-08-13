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

    // Upload the script files to the 'scripts/' prefix in the S3 bucket
    new s3deploy.BucketDeployment(this, 'DeployScripts', {
      sources: [s3deploy.Source.asset('scripts')], // path/to/local/scripts
      destinationBucket: bucket,
      destinationKeyPrefix: 'scripts/', // files will be uploaded under 'scripts/' prefix
    });

    // Upload the wheel file to the 'libs/' prefix in the S3 bucket
    new s3deploy.BucketDeployment(this, 'DeployWheelLibs', {
      sources: [s3deploy.Source.asset('wheel_libs')], // path/to/local/wheel_libs
      destinationBucket: bucket,
      destinationKeyPrefix: 'libs/', // files will be uploaded under 'libs/' prefix
    });

    // Create an IAM role for the Glue job
    const role = new iam.Role(this, 'GlueJobRole', {
      assumedBy: new iam.ServicePrincipal('glue.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSGlueServiceRole'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AWSGlueConsoleFullAccess'), // Example: Attach additional policies
      ],
    });

    // Add permissions to access S3 bucket and objects
    role.addToPolicy(new iam.PolicyStatement({
      actions: [
        's3:GetObject',
        's3:ListBucket',
      ],
      resources: [
        `arn:aws:s3:::${bucket.bucketName}`, // Permission to list the bucket
        `arn:aws:s3:::${bucket.bucketName}/scripts/*`, // Permission to get objects in the 'scripts/' directory
        `arn:aws:s3:::${bucket.bucketName}/wheels/*`, // Permission to get objects in the 'wheels/' directory
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
