#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { EcsServiceStack } from '../lib/ecs-stack';
import { OidcRoleStack } from '../lib/github-role-stack';
const app = new cdk.App();

// First-time bootstrap stack for GitHub OIDC
new OidcRoleStack(app, "OidcRoleStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: "us-east-1",
  }
});


new EcsServiceStack(app, 'EcsNodeService', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: "us-east-1",
  }
});

