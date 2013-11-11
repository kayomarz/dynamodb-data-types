var attr = require('dynamodb-data-types').AttributeValue;
var attrUpdate = require('dynamodb-data-types').AttributeValueUpdate;

var info = { name: "Foo", age: 50 };
var infoAttrValue = attr.wrap(info);

console.log(JSON.stringify(infoAttrValue));
// {"name":{"S":"Foo"},"age":{"N":"50"}}

var resume = {
    languageCount: 4,
    languages: ["Java Script", "Ruby", "GLSL", "C"]
}

var resumeAttrVal = {
  "languageCount": {"N": "4" },
  "languages": { "SS": ["Java Script", "Ruby", "GLSL", "C" ] }
}

console.log(JSON.stringify(attr.unwrap(resumeAttrVal)));
// {"languageCount":4,"languages":["Java Script","Ruby","GLSL","C"]}

console.log(attr.unwrap1({"N":"50"}));
console.log(attr.wrap1(50));
