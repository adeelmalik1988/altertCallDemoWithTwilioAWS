import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as iam from "aws-cdk-lib/aws-iam";
import * as appsync from "aws-cdk-lib/aws-appsync";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamo from "aws-cdk-lib/aws-dynamodb";
import * as s3 from "aws-cdk-lib/aws-s3"
import * as path from "path";
import { Effect } from 'aws-cdk-lib/aws-iam';
//import * as iam from "aws-cdk-lib"
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class BackendStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'BackendQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });


        const userPoolForPolly = new cognito.UserPool(this, "userPoolForPolly", {
          selfSignUpEnabled: true,
          accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
          userVerification: {
            emailStyle: cognito.VerificationEmailStyle.CODE,
          },
          autoVerify: {
            email: true,
          },
          standardAttributes: {
            email: {
              required: true,
              mutable: true,
            },
            phoneNumber: {
              required: true,
              mutable: true,
            },
          },
          signInCaseSensitive: true,
          passwordPolicy: {
            minLength: 8,
            requireLowercase: true,
            requireDigits: true,
            requireSymbols: true,
            requireUppercase: true,
          },
        });
    
        new CfnOutput(this, "UserPoolId", {
          value: userPoolForPolly.userPoolId,
        });
    
        // Create UserPoolClient
        const userPoolForPollyClient = new cognito.UserPoolClient( this, "TodoGraphqlUserPoolClient",{
            userPool: userPoolForPolly,
          }
        );
    
        new CfnOutput(this, "UserPoolClientId", {
          value: userPoolForPollyClient.userPoolClientId,
        });
    
        // Create lambda for graphql
        // const lambdaFunc = new NodejsFunction(this, "TodoLambda", {
        //   entry: path.join(__dirname, "..", "appsync-lambdas", "index.ts"),
        //   handler: "handler",
        //   functionName: "TodoLambda",
        //   runtime: lambda.Runtime.PYTHON_2_7,
        // });


        const s3BuketAudioDir = new s3.Bucket(this, "s3BuketAudioDir", {
          versioned: true,
          publicReadAccess: true,

        })

        const lambdaNewPostRole = new iam.Role(this,"lambdaNewPostRole",{
          assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
        })

        const policy = new iam.PolicyStatement({
          effect: Effect.ALLOW,
          actions: [
            "polly:*",
            "s3:*",
            "logs:CreateLogGroup",
            "logs:CreateLogStream",
            "logs:PutLogEvents"
          ],
          resources: ['*']
        })

        lambdaNewPostRole.addToPolicy(policy  )

        const lambdaNewPost = new lambda.Function(this, "lambdaNewPost",{
          handler: "index.handler",
          functionName: "lambdaNewPost",
          runtime: lambda.Runtime.NODEJS_14_X,
          code: lambda.Code.fromAsset("lambdas/newPost"),
          role: lambdaNewPostRole,
          environment: {
            S3_BUCKET_NAME: s3BuketAudioDir.bucketName,
            REGION: this.region,
            COGNITO_IDENTITY_POOL_ID: userPoolForPolly.userPoolId
          }


        })

        s3BuketAudioDir.grantReadWrite(lambdaNewPost)

        new CfnOutput(this, "s3BuketAudioDirName", {
          value: s3BuketAudioDir.bucketName
        })

        new CfnOutput(this, "region", {
          value: this.region,
        })
    
        // Create db tables
        // const todoTable = new dynamo.Table(this, "Todos", {
        //   tableName: "Todos",
        //   billingMode: dynamo.BillingMode.PAY_PER_REQUEST,
        //   partitionKey: {
        //     name: "id",
        //     type: dynamo.AttributeType.STRING,
        //   },
        //   // removalPolicy: RemovalPolicy.DESTROY,
        // });
    
        // // Create Graphql
        // const appsyncLoggingServiceRole = new iam.Role(
        //   this,
        //   "TodoAppsyncLoggingServiceRole",
        //   {
        //     assumedBy: new iam.ServicePrincipal("appsync.amazonaws.com"),
        //   }
        // );
    
        // appsyncLoggingServiceRole.addToPolicy(
        //   new iam.PolicyStatement({
        //     resources: ["*"],
        //     actions: ["cloudwatch:*", "logs:*"],
        //     effect: iam.Effect.ALLOW,
        //   })
        // );
    
        // const graphqlApi = new appsync.CfnGraphQLApi(this, "TodoGraphqlApiId", {
        //   name: "TodoGraphqlApiName",
        //   logConfig: {
        //     cloudWatchLogsRoleArn: appsyncLoggingServiceRole.roleArn,
        //     fieldLogLevel: "ALL",
        //   },
        //   authenticationType: "API_KEY",
    
        //   // additionalAuthenticationProviders: [
        //   //   {
        //   //     authenticationType: "AMAZON_COGNITO_USER_POOLS",
        //   //     userPoolConfig: {
        //   //       appIdClientRegex: userPoolClient.userPoolClientId,
        //   //       awsRegion: "ap-southeast-2",
        //   //       userPoolId: userPool.userPoolId,
        //   //     },
        //   //   },
        //   // ],
        // });
    
        // const graphApiKey = new appsync.CfnApiKey(this, "TodoGraphqlApiKey", {
        //   apiId: graphqlApi.attrApiId,
        // });
    
        // const graphqlApiSchema = new appsync.CfnGraphQLSchema(
        //   this,
        //   "TodoGraphqlApiSchema",
        //   {
        //     apiId: graphqlApi.attrApiId,
        //     definition: `
        //       schema {
        //         query:Query
        //       }
        //       type Query {
        //         listTodo: [Todo] @aws_cognito_user_pools
        //       }
        //       type Todo @aws_cognito_user_pools {
        //         id: ID!
        //         name: String!
        //         description: String!
        //       }
        //     `,
          
        //   }
        // );
    
        // const appsyncDynamoRole = new iam.Role(this, "TodoAppsyncDynamoDBRole", {
        //   assumedBy: new iam.ServicePrincipal("appsync.amazonaws.com"),
        // });
    
        // appsyncDynamoRole.addToPolicy(
        //   new iam.PolicyStatement({
        //     resources: ["*"],
        //     actions: ["dynamodb:*", "lambda:*", "logs:*", "cognito-idp:*"],
        //     effect: iam.Effect.ALLOW,
        //   })
        // );
    
        // const lambdaDataSource = new appsync.CfnDataSource(
        //   this,
        //   "TodoLambdaDataSource",
        //   {
        //     apiId: graphqlApi.attrApiId,
        //     name: "TodoLambdaDataSourceName",
        //     type: "AWS_LAMBDA",
        //     lambdaConfig: {
        //       lambdaFunctionArn: lambdaFunc.functionArn,
        //     },
        //     serviceRoleArn: appsyncDynamoRole.roleArn,
        //   }
        // );
    
        // const listTodoResolver = new appsync.CfnResolver(this, "listTodo", {
        //   apiId: graphqlApi.attrApiId,
        //   typeName: "Query",
        //   fieldName: "listTodo",
        //   dataSourceName: lambdaDataSource.name,
        // });
    
        // todoTable.grantFullAccess(lambdaFunc);

  }
}
