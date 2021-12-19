/* This example demonstrates use of UpdateExpression, ExpressionAttributeValues
 * and ExpressionAttributeNames.
 * Run this example on the command line as follows:
 * $ node 01-put-and-update-expression.js put
 * $ node 01-put-and-update-expression.js update
 * Observe the output dump shows the data structures as required by DynamoDb.
 * When running this example, you may choose to use a live DynamoDb instance
 * (optinal) by setting `USE_LIVE_DB`. If you choose to use a live DynamoDb
 * instance, you will to setup a DynamoDb table with name and key mentioned
 * below. */

/* See output of this example at the bottom of this file. It shows the data
 * structures which are generated and used for calling DynamoDB `UpdateItem`
 */

const attr = require("dynamodb-data-types").AttributeValue;
const { updateExpr } = require("dynamodb-data-types");
const {
  DynamoDBClient,
  UpdateItemCommand,
  PutItemCommand,
} = require("@aws-sdk/client-dynamodb");

const USE_LIVE_DB = true;
const REGION = "us-east-2";
const TableName = "TestTableForDynamoDbDataTypes"; // Hash key: `id' (Number)
const ID = 10;

const client = new DynamoDBClient({ region: REGION });

async function putPerson() {
  const person = {
    id: ID,
    name: "name-1",
    nickname: "nick",
    age: 20,
    weight: 50,
    height: 5,
    favColors: ["red", "green", "blue"],
    favNumbers: [1, 3, 8],
    year: [2000, 2004, 2008],
    languages: ["js", "c", "ruby"]
  };

  const params = {
    TableName,
    Item: attr.wrap(person)
  };
  console.log("Put person:");
  console.log(JSON.stringify(params, undefined, 2));

  if (!USE_LIVE_DB) {
    return;
  }

  try {
    return await client.send(new PutItemCommand(params));
  } catch (err) {
    console.error("put error:", err);
  }
}

async function updatePerson() {
  const personUpdates = updateExpr()
        .set({ name: "name-2" })
        .add({ age: 1 })
        .add({ weight: -3 })
        .remove("height, nickname, languages")
        .add({ favColors: ["orange"] })
        .delete({ favNumbers: [3] })
        .delete({ year: [2008] });

  const params = {
    TableName,
    Key: attr.wrap({ id: ID }),
    ...personUpdates.expr()
  };
  console.log("Update person:");
  console.log(JSON.stringify(params, undefined, 2));

  if (!USE_LIVE_DB) {
    return;
  }

  try {
    return await client.send(new UpdateItemCommand(params));
  } catch (err) {
    console.error("update error:", err);
  }
}

const action = process.argv[2];
if (!(action === "update" || action === "put")) {
  console.log(
    "no action specified\n" +
      "usage: node 01-put-update.js <action>\n" +
      "<action> should be either 'update' or 'put'."
  );
  process.exit(1);
}

switch(action) {
case "put": putPerson(); break;
case "update": updatePerson(); break;
}

/* The below output of running this example shows the data structures which are
 * generated and used for calling DynamoDB `UpdateItem`
 */

/* $ node 01-put-and-update-expression.js put
 * Put person:
 * {
 *   "TableName": "TestTableForDynamoDbDataTypes",
 *   "Item": {
 *     "id": {
 *       "N": "10"
 *     },
 *     "name": {
 *       "S": "name-1"
 *     },
 *     "nickname": {
 *       "S": "nick"
 *     },
 *     "age": {
 *       "N": "20"
 *     },
 *     "weight": {
 *       "N": "50"
 *     },
 *     "height": {
 *       "N": "5"
 *     },
 *     "favColors": {
 *       "SS": [
 *         "red",
 *         "green",
 *         "blue"
 *       ]
 *     },
 *     "favNumbers": {
 *       "NS": [
 *         "1",
 *         "3",
 *         "8"
 *       ]
 *     },
 *     "year": {
 *       "NS": [
 *         "2000",
 *         "2004",
 *         "2008"
 *       ]
 *     },
 *     "languages": {
 *       "SS": [
 *         "js",
 *         "c",
 *         "ruby"
 *       ]
 *     }
 *   }
 * }
 */

/* $ node 01-put-and-update-expression.js update
 * Update person:
 * {
 *   "TableName": "TestTableForDynamoDbDataTypes",
 *   "Key": {
 *     "id": {
 *       "N": "10"
 *     }
 *   },
 *   "UpdateExpression": "SET #A = :a REMOVE height, nickname, languages ADD age :b, weight :c, favColors :d DELETE favNumbers :e, #B :f",
 *   "ExpressionAttributeValues": {
 *     ":a": {
 *       "S": "name-2"
 *     },
 *     ":b": {
 *       "N": "1"
 *     },
 *     ":c": {
 *       "N": "-3"
 *     },
 *     ":d": {
 *       "SS": [
 *         "orange"
 *       ]
 *     },
 *     ":e": {
 *       "NS": [
 *         "3"
 *       ]
 *     },
 *     ":f": {
 *       "NS": [
 *         "2008"
 *       ]
 *     }
 *   },
 *   "ExpressionAttributeNames": {
 *     "#A": "name",
 *     "#B": "year"
 *   }
 * }
 */
