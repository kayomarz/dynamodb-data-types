var attr = require('dynamodb-data-types').AttributeValue;
var attrUpdate = require('dynamodb-data-types').AttributeValueUpdate;


console.log(attr.wrap({ 
  name: "Java Script",
  age: 18, 
  engines: ["Rhino", "v8", "SpiderMonkey", "Carakan", "JavaScriptCore"]
}));

console.log(JSON.stringify(attr.wrap({ name: "Foo", age: 50 })));

var resumeAttrVal = {
  count: {"N": "4" },
  languages: { "SS": ["Java Script", "Ruby", "GLSL", "C" ] }
};

console.log(JSON.stringify(attr.unwrap(resumeAttrVal)));
console.log(attr.unwrap1({"N":"50"}));
console.log(attr.wrap1(50));

var data1 = attrUpdate
    .put({name: "foo"})
    .add({age: 1})
    .delete("height, nickname")
    .add({favColors: ["red"]})
    .delete({favNumbers: [3]});

console.log(JSON.stringify(data1, undefined, 2));

