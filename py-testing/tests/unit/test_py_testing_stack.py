import aws_cdk as core
import aws_cdk.assertions as assertions
import pytest

from py_testing.py_testing_stack import PySimpleStack

# we don't want below 3 lines in order to receive a template code each time.
# we don't want to write them for each test scenario and ending up duplicated code
# also, this is a long operation. we want our tests faster by only sybthesizing the template 
# once in the beginning of our test suite and then using that template tthroughout our test.
# we can do this optimization by using python fixtures
# and we will create an initializer method with the annotation pytest.fixture(scope="session")
# if I wouldn't give this argument (scope="session") then this method would be called for 
# every test. but since the same template is used, we can only run once.
@pytest.fixture(scope="session")
def simple_template():
    # a stack needs an application object in order to exist
    app = core.App()
    # then create a stack
    stack = PySimpleStack(app, "py-testing")
    # then we are using a special method from the CDK testing library called "Template.from_stack()"
    # basically, we are getting the JSON template for our stack object. this is something like
    # a synthesizing step specifically for testing
    template = assertions.Template.from_stack(stack)

    return template

# example tests. To run these tests, uncomment this file along with the example
# resource in py_testing/py_testing_stack.py
def test_lambda_props(simple_template): 
    # now we can query resources and properties
    # run 'cdk synth' and in the output, check the lambda to know what the type is exactly 
    # e.g. AWS::Lambda::Function and any properties related to it
    simple_template.has_resource_properties("AWS::Lambda::Function", {
        "Runtime": "python3.11"
    })

    # check # of resources in our template
    simple_template.resource_count_is("AWS::Lambda::Function", 1)
