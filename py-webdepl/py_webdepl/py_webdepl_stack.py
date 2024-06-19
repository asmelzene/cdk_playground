from aws_cdk import (
    Stack,
    aws_s3, 
    aws_cloudfront,
    aws_cloudfront_origins,
    aws_s3_deployment,
    CfnOutput
)
from constructs import Construct
import os

class PyWebdeplStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        """
        first of all, we need to create a simple S3 bucket that will hold our static files.
        next, we will tell CDK where to look for our source code files for our static code. 
        therefore, in the web folder, usually in the dist folder (a folder which will contain what the website will require to run.)
        """
        
        deployment_bucket = aws_s3.Bucket(self, "PyWebDeplBucket")

        # we can switch to dist file using os:
        # we search for other paths inside our project
        ui_dir = os.path.join(os.path.dirname(__file__), "..", "..", "web", "dist")
        if not os.path.exists(ui_dir):
            # do not further generate CF
            print("UI dir not found: " + ui_dir)
            return
        
        # we will allow our CloudFront deployment to read from our bucket
        origin_identity = aws_cloudfront.OriginAccessIdentity(
            self, "PyOriginAccessIdentity"
        )
        deployment_bucket.grant_read(origin_identity)

        # let's create our ditribution
        distribution = aws_cloudfront.Distribution(
            self,
            "PyWebDeploymentDistribution",
            default_root_object="index.html", # default file that it will search for
            # link our origin_identity to our CloudFront distribution
            default_behavior=aws_cloudfront.BehaviorOptions(
                origin=aws_cloudfront_origins.S3Origin(
                    deployment_bucket, origin_access_identity=origin_identity
                )
            ),
        )

        # let's create a bucket deployment. it will take our files from CDK and it will put them to our bucket.
        # IMPORTANT: without 
        # distribution=distribution
        # our application will still work but it will have caching enabled, just like the documentation on the fly suggests.
        # if we use this, we will have our cache invalidate and this is what we really want because this will be
        # a very dynamic project. if we wouldn't have this then we will create the first time, and even if then
        # we change our files from S3, the CloudFront will return the cache, not the files, and we won't see any change inside
        # our implementation.
        aws_s3_deployment.BucketDeployment(self, "PyWebDeployment",
                                           destination_bucket=deployment_bucket,
                                           sources=[aws_s3_deployment.Source.asset(ui_dir)],
                                           distribution=distribution)
        
        # we need to point out the URL of our CloudFront distribution to see if everything works fine or not
        CfnOutput(self, "PyAppUrl",
                  value=distribution.distribution_domain_name) # distribution.distribution_domain_name = URL of our CloudFront distribution
        