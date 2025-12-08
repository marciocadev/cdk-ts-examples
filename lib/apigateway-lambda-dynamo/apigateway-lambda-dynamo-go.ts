import { NestedStack, NestedStackProps, RemovalPolicy } from "aws-cdk-lib";
import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { AttributeType, TableV2 } from "aws-cdk-lib/aws-dynamodb";
import { Architecture, Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { join } from "path";

export class ApiGatewayLambdaDynamoGoNestedStack extends NestedStack {
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
      tableName: "artist-album-tracks-go"
    });

    const postAlbum = new Function(this, "PostFunc", {
      functionName: "post-album-go",
      code: Code.fromAsset(join(__dirname, "functions", "go", "post", "bin")),
      runtime: Runtime.PROVIDED_AL2023,
      architecture: Architecture.ARM_64,
      handler: "bootstrap",
      environment: {
        "TABLE_NAME": table.tableName
      }
    });
    table.grantWriteData(postAlbum);

    const api = new RestApi(this, "ApiGateway", {
      restApiName: "apigateway-lambda-dynamo-go",
    });

    const album = api.root.addResource("album");
    album.addResource("post").addMethod("POST", new LambdaIntegration(postAlbum));
  }
}