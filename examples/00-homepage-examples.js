var attr = require('dynamodb-data-types').AttributeValue;
const { updateExpr } = require('dynamodb-data-types');

var data = {
  id: 10,
  food: ['Rice', 33, null],
  obj: {a:1, b:true},
};

var wrapped = attr.wrap(data);
console.log(JSON.stringify(wrapped));
// {
//   "id": {"N": "10"},
//   "food": {"SS": ["Rice", "Noodles"] },
//   "age": {"N": "1"},
//   "isThatYou": {"BOOL": true},
//   "stuff": {"L": [{"S": "Tomato"}, {"N": "33"}]},
//   "day": {"S": "Tuesday"}
// }

var unwrapped = attr.unwrap(wrapped);
console.log(JSON.stringify(unwrapped, undefined, 2));
// {
//   "id": 10,
//   "food": ["Rice", "Noodles"],
//   "age": 1,
//   "isThatYou": true,
//   "stuff": ["Tomato", 33],
//   "day": "Tuesday"
// }

var attrUpdate = require('dynamodb-data-types').AttributeValueUpdate;

var dataUpdates = attrUpdate
    .put({game: "Football"})
    .add({age: 1})
    .delete("day");
console.log(JSON.stringify(dataUpdates, undefined, 2));
// {
//   "game": {
//     "Action": "PUT",
//     "Value": {"S": "Football"}
//   },
//   "age": {
//     "Action": "ADD",
//     "Value": {"N": "1"}
//   },
//   "day": {
//     "Action": "DELETE"
//   }
// }

console.log(attr.wrap1(50)); // { N: '50' }
console.log(attr.unwrap1({"N":"50"})); // 50

console.log(attr.wrap1(-1));
console.log(attr.wrap1("Hello"));
console.log(attr.wrap1(true));
console.log(attr.wrap1(null));
console.log(attr.wrap1({a: 1, b: ''}))

console.log(JSON.stringify(
  updateExpr()             // updateExpr() creates a chainable object
    .set({ a: 'foo' })     // chain multiple clauses
    .add({ n: 1 })
    .remove('rat', 'bat')
    .set({ sky: 'blue'})
    .delete({ day: ['Mon'] }) // 'day' is a reserved keyword
    .remove('hi')
    .expr() // In the end expr() returns the UpdateExpression
  // After .expr(), we cannot chain any more clauses (set,remove,add,delete)
));
// {
//   UpdateExpression: 'SET a = :a REMOVE rat, bat ADD n :b DELETE #A :c',
//   ExpressionAttributeValues: { ':a': { S: 'foo' }, ':b': { N: '1' }, ':c': { SS: [Array] } },
//   ExpressionAttributeNames: { '#A': 'day' } // Because 'day' is a reserved keyword
// }
