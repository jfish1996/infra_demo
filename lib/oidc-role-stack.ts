import {  StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";

interface GitHubOidcRoleProps extends StackProps {
  repo: string; 
  roleName?: string;
}

export class GitHubOidcRole extends Construct {
  public readonly role: iam.Role;

  constructor(scope: Construct, id: string, props: GitHubOidcRoleProps) {
    super(scope, id);

    const { repo, roleName } = props;

    // GitHub OIDC provider
    const provider = new iam.OpenIdConnectProvider(this, "GitHubOIDC", {
      url: "https://token.actions.githubusercontent.com",
      clientIds: ["sts.amazonaws.com"],
    });

    // IAM Role assumed by GitHub Actions
    this.role = new iam.Role(this, "GitHubEcsDeployRole", {
      roleName: roleName ?? "GitHub-ECS-Deploy",
      assumedBy: new iam.WebIdentityPrincipal(provider.openIdConnectProviderArn, {
        "StringLike": {
          "token.actions.githubusercontent.com:sub": `repo:${repo}:*`
        },
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        }
      }),
    });

    // Permissions needed for ECS + ECR + CDK deploy
    this.role.addToPolicy(new iam.PolicyStatement({
      actions: [
        "ecr:*",
        "ecs:*",
        "iam:PassRole",
        "cloudformation:*",
        "logs:*",
        "s3:*"
      ],
      resources: ["*"]
    }));
  }
}
