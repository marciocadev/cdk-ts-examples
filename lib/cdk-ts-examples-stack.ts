import { Stack, StackProps } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { ApiGatewayLambdaDynamoTsNestedStack } from './apigateway-lambda-dynamo/apigateway-lambda-dynamo-ts';
import { ApiGatewayLambdaDynamoGoNestedStack } from './apigateway-lambda-dynamo/apigateway-lambda-dynamo-go';

export class CdkTsExamplesStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new ApiGatewayLambdaDynamoTsNestedStack(this, "ApiGatewayLambdaDynamoTS");
    new ApiGatewayLambdaDynamoGoNestedStack(this, "ApiGatewayLambdaDynamoGO");
  }
}
