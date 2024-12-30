import type { AWS } from "@serverless/typescript";
import { DynamoResources } from "./DB";

const serverlessConfiguration: AWS = {
  service: "infrastructure",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild"],
  provider: {
    name: "aws",
    runtime: "nodejs18.x",
    stage: "${env:MS_STAGE, 'dev'}",
    environment:{
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000"
    }
  },
  package:{
    individually: true
  },
  custom: {
    esbuild:{
      bundle: true,
      minify: true,
      sourcemap: true,
      exclude: ["aws-sdk"],
      define: {"require.resolve": undefined},
      platform: "node",
      concurrency: 10,
    }
  },
  resources: {
    Resources: {
      ...DynamoResources,
      //S3
      S3BucketDeployLambdas: {
        Type: "AWS::S3::Bucket",
        DeletionPolicy: "Retain",
        Properties: {
          BucketName: "utransfer-lambdas-${self:provider.stage}"
        }
      },
      //SNS
      SNSNotificationCode: {
        Type: "AWS::SNS::Topic",
        Properties: {
          TopicName: "notification-service-${self:provider.stage}",
        },
      },
      SQSNotificationCodeSubscription:{
        Type: "AWS::SNS::Subscription",
        Properties:{
          TopicArn: {
            Ref: "SNSNotificationCode"
          },
          Protocol: "email",
          Endpoint: "developer3@virtusproject.online",
          DeliveryPolicy: {
            healthyRetryPolicy:{
              numRetries: 3,
              minDelayTarget: 1,
              maxDelayTarget: 60,
              backoffFunction: "exponential"
            }
          }
        }
      },
      //SQS
      // queue to support ses related with register code user
      SQSNotificationCode: {
        Type: "AWS::SQS::Queue",
        Properties: {
          MessageRetentionPeriod: 86400,
          QueueName: "notification-service-${self:provider.stage}",
          VisibilityTimeout: 20,
        },
      },
      //=============SSM
      //=============SSM
      //=============SSM
      SSMS3BucketDeploymet: {
        Type: "AWS::SSM::Parameter",
        Properties: {
          Name: "/lambdas-${self:provider.stage}",
          Type: "String",
          Value: {
            Ref: "S3BucketDeployLambdas"
          },
        },
      },
      SSMNotificationCodeArn: {
        Type: "AWS::SSM::Parameter",
        Properties: {
          Name: "/notification-service/${self:provider.stage}/SQS_NOTIFICATION_ARN",
          Type: "String",
          Value: { "Fn::GetAtt": ["SQSNotificationCode","Arn"] },
        },
      },
      SSMNotificationCodeUrl: {
        Type: "AWS::SSM::Parameter",
        Properties: {
          Name: "/notification-service/${self:provider.stage}/SQS_NOTIFICATION_URL",
          Type: "String",
            Value: { "Fn::GetAtt": ["SQSNotificationCode","QueueUrl"] },
        },
      },
      SSMSNSNotificationCodeArn: {
        Type: "AWS::SSM::Parameter",
        Properties: {
          Name: "/notification-service/${self:provider.stage}/SNS_NOTIFICATION_ARN",
          Type: "String",
          Value: {
            Ref: "SNSNotificationCode",
          },
        },
      },
    }
  }
};

module.exports = serverlessConfiguration;
