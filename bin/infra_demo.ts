#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { EcsServiceStack } from '../lib/ecs-stack';
import { OidcRoleStack } from '../lib/github-role-stack';
import { EcrStack } from '../lib/ecr-stack';
const app = new cdk.App();

const deployAccount = process.env.CDK_DEFAULT_ACCOUNT;
const deployRegion =
  process.env.DEPLOY_REGION ?? process.env.CDK_DEFAULT_REGION ?? "us-west-2";
const sharedEnv = {
  account: deployAccount,
  region: deployRegion,
};

// First-time bootstrap stack for GitHub OIDC
new OidcRoleStack(app, "OidcRoleStack", { env: sharedEnv });

const ecrStack = new EcrStack(app, "EcrStack", { env: sharedEnv });

new EcsServiceStack(app, "EcsNodeService", {
  env: sharedEnv,
  repository: ecrStack.repository,
});

