import sys

# below is required for local testing only
# for AWS, it will read it from the S3 bucket we provided
# sys.path.append('wheel_glue/wheel_test_package/dist/my_package-0.1-py3-none-any.whl')
import my_module

my_module.hello_world()
