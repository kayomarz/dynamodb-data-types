var attr = require('dynamodb-data-types').AttributeValue;

var data = {
  id: 10,
  food: ['Rice', 'Noodles'],
  age: 1,
  isThatYou: true,
  stuff: ['Tomato', 33],
  day: 'Tuesday'
};

var dynamodbData = attr.wrap(data);
console.log(JSON.stringify(dynamodbData, undefined, 2));
// {
//   "id": {"N": "10"},
//   "food": {"SS": ["Rice", "Noodles"] },
//   "age": {"N": "1"},
//   "isThatYou": {"BOOL": true},
//   "stuff": {"L": [{"S": "Tomato"}, {"N": "33"}]},
//   "day": {"S": "Tuesday"}
// }

var unwrapped = attr.unwrap(dynamodbData);
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

console.log(attr.wrap1(50));
//{ N: '50' }

console.log(attr.unwrap1({"N":"50"}));
//50
