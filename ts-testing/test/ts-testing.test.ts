import * as cdk from 'aws-cdk-lib';
// this is the special testing library that CDK comes with.
// it will help us quite a lot when we will wrtie our tests
import { Template, Match, Capture } from 'aws-cdk-lib/assertions';
import * as TsTesting from '../lib/ts-testing-stack';

// run "npm test" to see if tests pass

// how we organize if we have multiple tests?
// a good practice with test is that they should test as little (specific) as possible 
// this means that we will write many tests but int the same time they will take a long time
// we will have a lot of code duplication when we want to generate this template for each test
// because for each CDK test, we will need an access to our template
// one solution to make our tests faster and remove the code duplication between different tests
// will be to generate our template one time at the beginning of our tests, and this is very easy
// to do with jest. we first need to organize our tests inside a test suite, and usually
// this test suite is initialized with the describe() function
// so, let's say we will put all our tests inside a describe function (or block)
describe('TsSimpleStack test suite', ()=>{
    // we want to generate the app outside the test for all our tests
    // to be able to use it. jest gives us some jest hooks (this is teh way they are called). 
    // we have the functions beforeAll or beforeEach (also after)

    // we need to access to the template object outside. 
    // for this, we will create a "let" object, and this will be a type of cdk.assertions.Template
    // and if we initialize this template here, then all our tests inside the "describe block"
    // will have access to this template
    let template: cdk.assertions.Template

    // let's have a beforeAll hook
    beforeAll(()=>{
        // all the stacks created by CDK needs to belong to an application
        // here, we can also speciy a "cdk.out" object. Otherwise our samples (genereated templates)
        // will go to an arbitrary folder
        const app = new cdk.App({
            outdir:'cdk.out/test' // outputs will go to this local folder
        }); 
            // WHEN 
        const stack = new TsTesting.TsSimpleStack(app, 'MyTestStack');
            // THEN
            // template is generated with this special function that comes 
            // from our assertions library inside AWS CDK library
            // this way, we have a synthesized template
        template = Template.fromStack(stack); 
    })


    // let's import this simple stack (ts-testing-stack.ts) inside our test
    // it is a good practice to have one testing file for each stack
    // this way, you can have your stacks organized properly
    test('Lambda runtime check', () => {
        // the important point is how we can reach a construct inside our template. 
        // with the template from stack method, now we get access to our template but 
        // how we can reach a certain construct?

        // method-1: hasResourceProperties 
        // you can look into "MyTestStack.template.json" to see the properties
        template.hasResourceProperties('AWS::Lambda::Function', {
            Runtime: "nodejs18.x"
        });
        template.resourceCountIs('AWS::Lambda::Function', 1)
    })

    // Matchers
    test('Lambda runtime check', () => {
        template.hasResourceProperties('AWS::Lambda::Function', {
          Runtime: Match.stringLikeRegexp('nodejs')
        });
      });
    
    test('Lambda bucket policy, with matchers', () => {
        template.hasResourceProperties('AWS::IAM::Policy',
            Match.objectLike({
            PolicyDocument: {
                Statement: [{
                Resource: [{
                    'Fn::GetAtt': [
                    Match.stringLikeRegexp('SimpleBucket'),
                    'Arn'
                    ]
                },
                Match.anyValue() // this is important if there are multiple matches
                ]
                }]
            }
            })
        );
    });

    // helps us to capture arguments of resources. e.g. Actions
    test('Lambda actions, with capture', () => {
        const lambdaActionsCapture = new Capture();

        template.hasResourceProperties('AWS::IAM::Policy', {
            PolicyDocument: {
            Statement: [{
                Action: lambdaActionsCapture
            }]
            }
        })

        const expectedActions = [
            "s3:GetObject*",
            "s3:GetBucket*",
            "s3:List*"
        ]

        // another way of comparing 2 arrays is sorting and comparing them since they can be in different orders
        expect(lambdaActionsCapture.asArray()).toEqual(
            expect.arrayContaining(expectedActions)
        )
    });

    // very easy to implement but it is difficult to maintain with many randomly generated string in asset names
    // e.g. SimpleBucket250AC437
    // the first time we run this test ("npm test"), a new snapshot will be created. 
    // we will see a new folder named __snapshots__ in the test folder. you'll see a snap in this folder.
    // if we run our test again, our test will read from the generated snapshot. (e.g. versioned: false)
    // then test fails, because the test comparison fails. 
    // we can either update our test or regenerate (update) the snapshot "npm test -- -u"
    test('Bucket properties with snapshot', ()=>{
        const bucketTemplate = template.findResources("AWS::S3::Bucket");
        expect(bucketTemplate).toMatchSnapshot()
    })

});
