import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecsPatterns from "aws-cdk-lib/aws-ecs-patterns";
import * as ecr from "aws-cdk-lib/aws-ecr";
import { GitHubOidcRole } from "./oidc-role-stack";

export class EcsServiceStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const vpc = new ec2.Vpc(this, "Vpc", { maxAzs: 2 });

        const cluster = new ecs.Cluster(this, "Cluster", {
            vpc,
        });

        // newing up the role to be made for github actions
        new GitHubOidcRole(this, "GitHubDeployRole", {
            repo: "jfish1996/infra_demo",    
            roleName: "GitHub-ECS-Deploy"
        });

        const repository = new ecr.Repository(this, "Repository", {
            repositoryName: "node-app",
            imageScanOnPush: true,
        });

        const service = new ecsPatterns.ApplicationLoadBalancedFargateService(
            this,
            "FargateService",
            {
                cluster,
                publicLoadBalancer: true,
                desiredCount: 1,
                cpu: 256,
                memoryLimitMiB: 512,
                taskImageOptions: {
                    image: ecs.ContainerImage.fromEcrRepository(repository, "latest"),
                    containerPort: 3000,
                },
            }
        );

        service.targetGroup.configureHealthCheck({
            path: "/",
            port: "3000"
        });
    }
}
