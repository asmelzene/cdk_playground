from aws_cdk import (
    aws_glue as glue,
    aws_s3 as s3,
    core
)

class GlueJobStack(core.Stack):
    def __init__(self, scope: core.Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        # Create an S3 bucket to store the wheel file
        bucket_wheel = s3.Bucket(self, "GlueJobBucket-wheel")

        # Create an S3 bucket to store python script
        bucket_script = s3.Bucket(self, "GlueJobBucket-script")

        # Glue job role
        role = glue.CfnJob.Role(
            self, "GlueJobRole",
            role_name="glue-job-role"
        )

        # Create the Glue job
        job = glue.CfnJob(self, "GlueJob",
            role=role.role_name,
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
