#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { EcsServiceStack } from '../lib/ecs-stack';

const app = new cdk.App();


new EcsServiceStack(app, 'EcsNodeService', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: "us-west-2",
  }
});