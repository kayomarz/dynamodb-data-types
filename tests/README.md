# Running tests

Tests are run using [Jasmine](https://github.com/pivotal/jasmine/wiki). See
[jasmine-node](https://github.com/mhevery/jasmine-node).

## Install dependancies to run tests.

```sh
npm install
npm install jasmine-node -g
```

## Run local tests

```sh
cd dynamodb-data-types/tests/
jasmine-node spec/
```

## Run tests with a live DynamoDb table

### Requirements

To test with a live DynamoDb, specify DynamoDb credentials using
environment variables. For details see configuration of [Amazon SDK for Node.js](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html)

For example, on linux:

```sh
$ export AWS_SECRET_ACCESS_KEY="key"; export AWS_ACCESS_KEY_ID="key-id"
```

Run the test using a live DynamoDB:

```sh
cd dynamodb-data-types/tests/
jasmine-node spec-dynamo/
```

Note that the environment variables exported in the above command won't persist
after logging out of the shell.

