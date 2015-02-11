# Running tests

Tests are run using [Jasmine](https://github.com/pivotal/jasmine/wiki). See
[jasmine-node](https://github.com/mhevery/jasmine-node).

## Install dependancies to run tests.

```sh
cd dynamodb-data-types/
npm install
npm install jasmine-node -g
```

## Run local tests

```sh
jasmine-node tests/spec/
```

## Run tests with a live DynamoDb table

### Requirements

To test with a live DynamoDb, create a DynamoDb table as follows:

  + Table name: TestTableForDynamoDbDataTypes
  + Primary key type: Hash
  + Hash attribute name: id
  + Hash attribute type: Number

Use AWS access key credentials with read, write permissions to the above
table. You can do this using envirnoment variables. For details how to specify
credentials, see configuring
[Amazon SDK for Node.js](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html) 


For example, on linux:

```sh
$ export AWS_SECRET_ACCESS_KEY="key"; export AWS_ACCESS_KEY_ID="key-id"
```

After the AWS table has been setup and AWS access key specified, run the test
using a live DynamoDB as follows:

```sh
jasmine-node tests/spec-dynamo
```
