#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { GlueJobStack2 } from '../lib/ts-glue-cdk-example-stack'; // Ensure this import matches your class name

const app = new cdk.App();
new GlueJobStack2(app, 'GlueJobStack2'); // Ensure this matches the stack class name
