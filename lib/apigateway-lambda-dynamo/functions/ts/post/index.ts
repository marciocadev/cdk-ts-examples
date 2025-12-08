import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";

const client = new DynamoDBClient();

export const handler = async (event: APIGatewayEvent, context: Context):
  Promise<APIGatewayProxyResult> => {

  const artist = JSON.parse(event.body!);

  console.log(artist)

  const item = marshall(artist);

  const data = await client.send(new PutItemCommand({
    TableName: process.env.TABLE_NAME,
    Item: item
  }));

  return {
    statusCode: 200,
    body: JSON.stringify({ message: data }),
  };
}