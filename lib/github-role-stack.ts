import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export class OidcRoleStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const oidcProvider = new iam.OpenIdConnectProvider(this, "GitHubOIDC", {
            url: "https://token.actions.githubusercontent.com",
            clientIds: ["sts.amazonaws.com"],
        });

        const githubActionsRole = new iam.Role(this, "GitHubActionsRole", {
            roleName: "GitHub-ECS-Deploy",  // <- add this
            assumedBy: new iam.FederatedPrincipal(
                oidcProvider.openIdConnectProviderArn,
                {
                    StringLike: {
                        "token.actions.githubusercontent.com:sub": "repo:jfish1996/infra_demo:*",
                    },
                    StringEquals: {
                        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
                    },
                },
                "sts:AssumeRoleWithWebIdentity"
            ),
            description: "Role assumed by GitHub Actions via OIDC",
        });

        githubActionsRole.addManagedPolicy(
            iam.ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess")
        );
    }
}