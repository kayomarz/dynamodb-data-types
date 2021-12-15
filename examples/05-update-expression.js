/* This example demonstrates use of AttributeValue and AttributeValueUpdate.
 * Run this example on the command line as follows:
 * $ node 05-update-expression.js put
 * $ node 05-update-expression.js update
 * Observe the output dump shows the data structures as required by DynamoDb.
 * When running this example, you may choose to use a live DynamoDb instance
 * (optinal) by setting `USE_LIVE_DB`. If you choose to use a live DynamoDb
 * instance, you will to setup a DynamoDb table with name and key mentioned
 * below. */

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
    weight: 50, // Kg
    height: 5, // Feet
    favColors: ["red", "green", "blue"],
    favNumbers: [1, 3, 8],
    languages: ["js", "c", "ruby"]
  };

  const params = {
    TableName,
    Item: attr.wrap(person)
  };
  console.log("Put person:\n", JSON.stringify(params, undefined, 2));

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
  // .set({ name: "name-2" })
        .add({ age: 1 })
        .add({ weight: -3 })
        .remove("height, nickname, languages")
        .add({ favColors: ["orange"] })
        .delete({ favNumbers: [3] })
        .expr();

  const params = {
    TableName,
    Key: attr.wrap({ id: ID }),
    ...personUpdates
  };
  console.log("Update Person:\n", JSON.stringify(params, undefined, 2));

  if (!USE_LIVE_DB) {
    return;
  }

  try {
    return await client.send(new UpdateItemCommand(params));
  } catch (err) {
    console.error("update error:", err);
  }
}

// Note: The action to delete favColor blue does not appear in
// `AttributeUpdates' structure because it gets overwritten by the next action
// to add favColor orange.

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
