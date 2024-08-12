from aws_cdk import App
from glue_cdk_example.glue_cdk_example_stack import GlueCdkExampleStack

app = App()
GlueCdkExampleStack(app, "GlueCdkExampleStack")

app.synth()
