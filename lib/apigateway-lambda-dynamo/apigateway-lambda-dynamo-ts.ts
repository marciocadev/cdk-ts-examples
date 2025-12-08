import { NestedStack, NestedStackProps, RemovalPolicy } from "aws-cdk-lib";
import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { AttributeType, TableV2 } from "aws-cdk-lib/aws-dynamodb";
import { Architecture, Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import path from "path";

export class ApiGatewayLambdaDynamoTsNestedStack extends NestedStack {
  constructor(scope: Construct, id: string, props?: NestedStackProps) {
    super(scope, id, props);

    const table = new TableV2(this, "DynamoDB", {
      partitionKey: {
        name: "Artist",
        type: AttributeType.STRING
      },
      sortKey: {
        name: "Album",
        type: AttributeType.STRING
      },
      removalPolicy: RemovalPolicy.DESTROY,
      tableName: "artist-album-tracks-ts"
    });

    const postAlbum = new NodejsFunction(this, "PostFunc", {
      functionName: "post-album-ts",
      entry: path.join(__dirname, "functions", "ts", "post", "index.ts"),
      runtime: Runtime.NODEJS_LATEST,
      architecture: Architecture.ARM_64,
      handler: "index.handler",
      environment: {
        "TABLE_NAME": table.tableName
      }
    });
    table.grantWriteData(postAlbum);

    const api = new RestApi(this, "ApiGateway", {
      restApiName: "apigateway-lambda-dynamo-ts",
    });

    const album = api.root.addResource("album");
    album.addResource("post").addMethod("POST", new LambdaIntegration(postAlbum));
  }
}