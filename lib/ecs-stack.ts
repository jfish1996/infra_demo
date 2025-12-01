import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecsPatterns from "aws-cdk-lib/aws-ecs-patterns";
import * as ecr from "aws-cdk-lib/aws-ecr";

interface EcsServiceStackProps extends cdk.StackProps {
  repository: ecr.IRepository;
}

export class EcsServiceStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: EcsServiceStackProps) {
        super(scope, id, props);

        const { repository } = props;

        const imageTagParam = new cdk.CfnParameter(this, "ImageTag", {
            default: "latest",
            description: "Docker image tag to deploy to ECS",
        });

        const vpc = new ec2.Vpc(this, "Vpc", { maxAzs: 2 });

        const cluster = new ecs.Cluster(this, "Cluster", {
            vpc,
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
                    image: ecs.ContainerImage.fromEcrRepository(
                        repository,
                        imageTagParam.valueAsString
                    ),
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
