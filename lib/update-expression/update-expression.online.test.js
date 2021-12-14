const {
  DynamoDBClient,
  DeleteItemCommand,
  UpdateItemCommand,
  PutItemCommand,
  GetItemCommand,
} = require("@aws-sdk/client-dynamodb");

const attr = require("../AttributeValue");
const { updateExpr } = require("./update-expression");

const SECONDS_30 = 30000;
jest.setTimeout(SECONDS_30);

const WAIT = 1000 * 1;
const waitABit = async () => new Promise(res => setTimeout(res, WAIT));

const REGION = "us-east-2";
const TableName = "TestTableForDynamoDbDataTypes"; // Hash key: `id" (Number)
const client = new DynamoDBClient({ region: REGION });

function getRandomInt() {
  const min = Math.ceil(100);
  const max = Math.floor(min * 10000);
  return Math.floor(
    Math.random() * (max - min) + min // inclusive of min, exclusive of max
  );
}

let id;
const age = 20;

beforeAll(async () => {
  id = getRandomInt();
  expect(await getPerson(id)).toBeUndefined();
  const personInfo = {
    id,
    name: "name-1",
    nickname: "nick",
    age,
    weight: 50,
    height: 5,
    favColors: ["red", "green", "blue"],
    roles: ["admin", "user"],
    day: [1, 3, 8],
    languages: ["js", "c", "ruby"]
  };

  await putPerson(personInfo);
  await waitABit(); // eventually consistent
  const r2 = await getPerson(id);
  expect(r2).toEqual({
    id,
    name: "name-1",
    nickname: "nick",
    age: 20,
    weight: 50,
    height: 5,
    favColors: ["blue", "green", "red"],
    roles: ["admin", "user"],
    day: [8, 3, 1],
    languages: ["c", "js", "ruby"],
  });
});

afterAll(async () => {
  await rmPerson(id);
  await waitABit(); // eventually consistent
  expect(await getPerson(id)).toBeUndefined();
});

test("update", async () => {
  const ageAdd1 = getRandomInt();
  const updateProps = updateExpr()
        .set({ name: "name-2" })
        .add({ age: ageAdd1 })
        .add({ weight: -3 })
        .remove("height, nickname, languages")
        .delete({ roles: ["admin"] })
        .add({ favColors: ["orange"] })
        .delete({ day: [3] })
        .done();
  await updateExpressionPerson(id, updateProps);
  await waitABit(); // eventually consistent
  const r4 = await getPerson(id);
  expect(r4).toEqual({
    id,
    name: "name-2",
    age: age + ageAdd1,
    weight: 47,
    favColors: ["blue", "green", "orange", "red"],
    roles: ["user"],
    day: [8, 1],
  });
});

async function putPerson(person) {
  const params = { TableName, Item: attr.wrap(person) };
  try {
    return await client.send(new PutItemCommand(params));
  } catch (err) {
    console.error("put error:", err);
  }
}

async function getPerson(id) {
  const params = { TableName, Key: attr.wrap({ id }) };
  try {
    const resp = await client.send(new GetItemCommand(params));
    const p = typeof resp.Item !== "undefined" ?
          attr.unwrap(resp.Item) :
          undefined;
    return p;
  } catch (err) {
    console.error("put error:", err);
  }
}

async function rmPerson(id) {
  const params = { TableName, Key: attr.wrap({ id }) };
  try {
    await client.send(new DeleteItemCommand(params));
  } catch (err) {
    console.error("put error:", err);
  }
}

async function updateExpressionPerson(id, updateProps) {
  // console.log("******** updateProps", updateProps);
  const params = {
    TableName,
    Key: attr.wrap({ id }),
    ...updateProps
  };

  try {
    return await client.send(new UpdateItemCommand(params));
  } catch (err) {
    console.error("update error:", err);
  }
}
