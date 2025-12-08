* go mod init post
* go get github.com/aws/aws-sdk-go-v2/service/dynamodb
* go get github.com/aws/aws-lambda-go/lambda

* x86_64: cd lib/apigateway-lambda-dynamo/functions/go/post && GOOS=linux GOARCH=amd64 go build -o bin/bootstrap

* ARM64: cd lib/apigateway-lambda-dynamo/functions/go/post && GOOS=linux GOARCH=arm64 go build -o bin/bootstrap