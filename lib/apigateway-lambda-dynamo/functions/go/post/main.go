package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

var (
	client    *dynamodb.Client
	tableName string
)

// Track structure
type Track struct {
	Title  string `json:"Title"`
	Length string `json:"Length"`
}

// Payload structure
type Music struct {
	Artist string  `json:"Artist"`
	Album  string  `json:"Album"`
	Tracks []Track `json:"Tracks"`
}

func init() {
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		panic(fmt.Sprintf("unable to load SDK config, %v", err))
	}
	client = dynamodb.NewFromConfig(cfg)

	tableName = os.Getenv("TABLE_NAME")
	if tableName == "" {
		panic("TABLE_NAME not provided")
	}
}

func handler(
	ctx context.Context,
	request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	var music Music

	// Parse JSON body
	err := json.Unmarshal([]byte(request.Body), &music)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 400,
			Body:       fmt.Sprintf("Invalid request body: %v", err),
		}, nil
	}

	// Convert Tracks slice into DynamoDB list of maps
	var trackList []types.AttributeValue
	for _, t := range music.Tracks {
		trackMap := map[string]types.AttributeValue{
			"Title":  &types.AttributeValueMemberS{Value: t.Title},
			"Length": &types.AttributeValueMemberS{Value: t.Length},
		}
		trackList = append(trackList, &types.AttributeValueMemberM{Value: trackMap})
	}

	// Put item into DynamoDB
	_, err = client.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: aws.String(tableName),
		Item: map[string]types.AttributeValue{
			"Artist": &types.AttributeValueMemberS{Value: music.Artist},
			"Album":  &types.AttributeValueMemberS{Value: music.Album},
			"Tracks": &types.AttributeValueMemberL{Value: trackList}, // list of maps
		},
	})
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Body:       fmt.Sprintf("Failed to save item: %v", err),
		}, nil
	}

	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Body:       fmt.Sprintf("Saved: %s - %s with %d tracks", music.Artist, music.Album, len(music.Tracks)),
	}, nil
}

func main() {
	lambda.Start(handler)
}
