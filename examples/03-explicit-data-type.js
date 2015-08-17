/* This example demonstrates use of explicit data type.
 * Run this example on the command line as follows:
 * $ node 03-explicit-data-type.js
 * Observe the output dump shows the data structures as required by DynamoDb.
 * When running this example, you may choose to use a live DynamoDb instance
 * (optinal) by setting `USE_LIVE_DB'. If you choose to use a live DynamoDb
 * instance, you will to setup a DynamoDb table with name and key mentioned
 * below. */

var ddt = require('dynamodb-data-types');
var attr = ddt.AttributeValue;
var attrUpdate = ddt.AttributeValueUpdate;

var USE_LIVE_DB = false;
var TABLE_NAME = "TestTableForDynamoDbDataTypes"; // Hash key: `id' (Number).
var dynamo = dynamoDb(USE_LIVE_DB);

function putData(data, id, data_opts, callback) {
  data.id = id;
  var opts = {
    TableName: TABLE_NAME,
    Item: attr.wrap(data, data_opts)
  };

  dynamo.putItem(opts, function(err){ 
    if (err)
      console.error("put error:", err); 
    callback(err);
  });
}

function getData(id, callback) {
  var opts = {
    TableName: TABLE_NAME,
    Key: attr.wrap({id: id})
  };

  dynamo.getItem(opts, function(err, data){ 
    if (err)
      console.error("put error:", err); 
    else
      callback(null, data.Item);
  });
}

function dynamoDb(useLiveDb) {
  // If not using a live db, just return dummy functions.
  if (!useLiveDb) {
    return {
      putItem: function dummyPut(){},
      getItem: function dummyGet(){ 
	console.log('To read data from DynamoDB, set USE_LIVE_DB=true');
      }
    };
  }

  /* If using a live db, you need to create the necessary table and key.
   * Note: As per Amazon's recommended configuration, `accessKeyId' and
   * `secretAccessKey' are read from environment variables
   * `AWS_SECRET_ACCESS_KEY' and `AWS_ACCESS_KEY_ID'. 
   */
  
  var AWS = require('aws-sdk');
  AWS.config.update({region: 'us-east-1'});
  var dynamo = new AWS.DynamoDB({apiVersion: '2013-10-16'});

  return dynamo;
}

var data = {
  alphabets: ['c', 'a', 'b']
};

var opts = { types: { alphabets: 'L' } };

console.log("Put data without explicit type:\n", JSON.stringify(attr.wrap(data)));
// Put data without explicit type:
// {"alphabets":{"SS":["c","a","b"]},"id":{"N":"3"}}

console.log("Put data with explicity type 'L':\n", JSON.stringify(attr.wrap(data, opts)));
// Put data with explicity type 'L':
// {"alphabets":{"L":[{"S":"c"},{"S":"a"},{"S":"b"}]},"id":{"N":"3"}}



var dbId = 3;

putData(data, dbId, opts, function(err) {
  console.log('put alphabets:', data.alphabets);
  getData(dbId, function(err, data) {
    console.log('get alphabets:', attr.unwrap(data).alphabets);
  });
});
