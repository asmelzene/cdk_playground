from aws_cdk import (
    Stack,
    aws_glue as glue,
    aws_s3 as s3
)
from constructs import Construct

class GlueJobStack2(Stack):
    def __init__(self, scope: Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        # Create an S3 bucket to store the wheel file
        bucket_wheel = s3.Bucket(self, "GlueJobBucket-wheel-v2")

        # Create an S3 bucket to store the Python script
        bucket_script = s3.Bucket(self, "GlueJobBucket-script-v2")

        # Create the Glue job
        job = glue.CfnJob(self, "GlueJob2",
            role='glue-job-role',  # Replace this with a valid IAM role ARN or create a role resource
            command=glue.CfnJob.JobCommandProperty(
                name="glueetl",
                script_location=f"s3://{bucket_script.bucket_name}/simple_glue_script.py",
                python_version="3"
            ),
            default_arguments={
                "--extra-py-files": f"s3://{bucket_wheel.bucket_name}/my_package-0.1-py3-none-any.whl"
            },
            max_retries=0,
            number_of_workers=2,
            worker_type="G.1X"
        )
