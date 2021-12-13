/* This example demonstrates putting an image (binary data) into a dynamoDb
 * table and retreiving it. To run this exmple you need to create the necessary
 * table and key. For this example, you may use Amazon's configuration via
 * environment variables `AWS_SECRET_ACCESS_KEY' and `AWS_ACCESS_KEY_ID'.
 * Run this example on the command line as follows:
 * $ node 02-binary-image.js put
 * $ node 02-binary-image.js get
 * Observe the output dump shows the data structures as required by DynamoDb.
 * When running this example, you may choose to use a live DynamoDb instance
 * (optinal) by setting `USE_LIVE_DB'. If you choose to use a live DynamoDb
 * instance, you will to setup a DynamoDb table with name and key mentioned
 * below. */

const attr = require('dynamodb-data-types').AttributeValue;
const attrUpdate = require('dynamodb-data-types').AttributeValueUpdate;

const USE_LIVE_DB = false;
const REGION = 'us-east-1';
const TABLE_NAME = 'TestTableForDynamoDbDataTypes'; // Hash key: `id' (Number).
const dynamo = dynamoDb(USE_LIVE_DB);

const fs = require('fs');

function dynamoDb(useLiveDb) {
  const AWS = require('aws-sdk');
  AWS.config.update({region: REGION});
  const dynamo = new AWS.DynamoDB({apiVersion: '2013-10-16'});

  return dynamo;
}

function putItemBinary(path, id) {
  console.log('file read: ', path);
  fs.readFile(path, function(err, data) {
    if (err)
      return console.log('file read error:', err.message);

    console.log('file read ok; instance of Buffer: ', data instanceof Buffer);

    const opts = {
      TableName: TABLE_NAME,
      Item: attr.wrap({
	id: id,
	img: data
      })
    };

    console.log('putItem:\n', opts);
    dynamo.putItem(opts, function(err){
      console.error('putItem', err ? 'error\n' + err : 'ok');
    });
  });
}

function getItemAndSave(id, filename) {
  const opts = {
    TableName: TABLE_NAME,
    Key: attr.wrap({
      id: id
    })
  };

  dynamo.getItem(opts, function(err, _data) {
    if (err)
      return console.error('getItem error:', err);
    if (!_data.Item)
      return console.error('No Item for requested options', opts);

    console.log(_data);
    const data = attr.unwrap(_data.Item);
    console.log(data);
    fs.writeFileSync(filename, data.img);
  });
}

const action = process.argv[2];
if (!(action === 'get' || action === 'put')) {
  console.log(
    'no action specified\n' +
      'usage: node 02-binary-image.js <action>\n' +
      '<action> should be either \'put\' or \'get\'.'
  );
  process.exit(1);
}

const inPath = 'images/img.jpg';
const outPath = 'images/out-img.jpg';
const dbId = 2; // arbitrary ID

switch(action) {
  case 'put': putItemBinary(inPath, dbId); break;
  case 'get': getItemAndSave(dbId, outPath); break;
}
