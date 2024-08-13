#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { GlueJobStack } from '../lib/ts-glue-cdk-example-stack'; // Ensure this import matches your class name

const app = new cdk.App();
new GlueJobStack(app, 'GlueJobStack'); // Ensure this matches the stack class name
