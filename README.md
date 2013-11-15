# DynamoDb-Data-Types

A utility for Amazon DynamoDB __Data Types__ for AWS SDK for Node.js.

This utility is designed to be used in complement with the [Amazon SDK for
Node.js]((http://aws.amazon.com/sdkfornodejs/). It helps to represent
Amazon DybamoDb data types.

## How is it useful?

Following are some key-value pairs:

```js
var data = { 
    name: 'Java Script',
    age: 18, 
    engines: [ 'Rhino', 'v8', 'SpiderMonkey', 'Carakan', 'JavaScriptCore' ]
}
```

In order to put the above data into DynamoDB, the AWS SDK requires it to be
represented as:

```
{ 
    name: { S: 'Java Script' },
    age: { N: '18' },
    engines: { SS: [ 'Rhino','v8','SpiderMonkey','Carakan','JavaScriptCore' ] }
}
```

This utility helps to construct such representations required by the __AWS SDK
for Node.js__ 

```js
var attr = require('dynamodb-data-types').AttributeValue;
attr.wrap(data);
```

## Features

The current version supports the following data types:

 * AttributeValue
 * AttributeValueUpdate

DynamoDB data types: [docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Types.html](http://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Types.html)


## Quick Examples

```javascript
var attr = require('dynamodb-data-types').AttributeValue;

var infoAttrValue = attr.wrap({ name: "Foo", age: 50 });
console.log(JSON.stringify(infoAttrValue));
// {"name":{"S":"Foo"},"age":{"N":"50"}}

var experience = {
  count: {"N": "4" },
  languages: { "SS": ["Java Script", "Ruby", "GLSL", "C" ] }
}
console.log(JSON.stringify(attr.unwrap(experience)));
// {"count":4,"languages":["Java Script","Ruby","GLSL","C"]}
```

## More examples

 + [examples/01-put-update.js](https://github.com/kayomarz/dynamodb-data-types/blob/master/examples/01-put-update.js)


## Download

The source is available for download from
[github.com/kayomarz/dynamodb-data-types](https://github.com/kayomarz/dynamodb-data-types).

To install using Node Package Manager (npm):

    npm install dynamodb-data-types


## Untested feature

The current version of this library has not been tested with binary types `B`
and `BS`.  __These will be done sometime soon__.

PS: Please feel free to share any working code you might have to put/get binary
data - it would help me complete these tests.


## Documentation

### AttributeValue
[AWS API Reference -
AttributeValue](http://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_AttributeValue.html) 

* [wrap](#wrap)
* [unwrap](#unwrap)
* [wrap1](#wrap1)
* [unwrap1](#unwrap1)

### AttributeValueUpdate
[AWS API Reference -
AttributeValueUpdate](http://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_AttributeValueUpdate.html) 

* [put](#put)
* [add](#add)
* [delete](#delete)

## AttributeValue

<a name="wrap"  />
### wrap(item)

Wrap object properties into DynamoDB's AttributeValue data type.

#### Arguments

 * @param {Object} item The object to wrap.
 * @return {Object} A DynamoDb AttributeValue.

__Example__

```javascript
var attr = require('dynamodb-data-types').AttributeValue;
attr.wrap({name: "Foo", age: 50});
// {"name":{"S":"Foo"},"age":{"N":"50"}}
```

<a name="unwrap"  />

### unwrap(attributeValue)

Unwrap DynamoDB AttributeValues to values of the appropriate types.

#### Arguments

 * @param {Object} attributeValue The DynamoDb AttributeValue to unwrap.
 * @return {Object} Unwrapped object with properties.

__Example__

```javascript
var attr = require('dynamodb-data-types').AttributeValue;
attr.unwrap({"name":{"S":"Foo"},"age":{"N":"50"}});
// {name: "Foo", age: 50}
```

<a name="wrap1"  />

### wrap1(value)

Wrap a single value into DynamoDB's AttributeValue.

#### Arguments

 * @param {String|Number|Array} 
 * @return {Object} DynamoDB AttributeValue.

__Example__

```javascript
var attr = require('dynamodb-data-types').AttributeValue;
attr.wrap1(50);
// {"N":"50"}
```


<a name="unwrap1"  />

### unwrap1(attributeValue)

Unwrap a single DynamoDB's AttributeValue to a value of the appropriate
javascript type. 

#### Arguments

@param {Object} attributeValue The DynamoDB AttributeValue.
@return {String|Number|Array}  The javascript value.

__Example__

```javascript
var attr = require('dynamodb-data-types').AttributeValue;
attr.unwrap1({"N":"50"});
// 50
```


## AttributeValueUpdate

<a name="add"  />

### add(attrs)

Append attributes to be updated with action "ADD".
This function can be chained with further calls to `add`, `put` or `delete`.

#### Arguments

 * @param {Object} attrs Object with attributes to be updated.
 * @return {Updates} Object with all update attributes in the chain.

<a href="#example_put_add_delete">Example - put, add, delete.</a>

See note: <a href="#duplicate_attr_name">duplicate attribute names</a>

<a name="put"  />

### put(attrs)

Append attributes to be updated with action "PUT".
This function can be chained with further calls to `add`, `put` or `delete`.

#### Arguments

 * @param {Object} attrs Object with attributes to be updated.
 * @return {Updates} Object with all update attributes in the chain.

<a href="#example_put_add_delete">Example - put, add, delete.</a>

See note: <a href="#duplicate_attr_name">duplicate attribute names</a>

<a name="delete"  />

### delete(attrs)

Append attributes to be updated with action "DELETE".
This function can be chained with further calls to `add`, `put` or `delete`.

#### Arguments

 * @param {Object|String|Array} attrs If this argument is an an Object,the
   Object's property values must be an array, containing elements to be removed,
   as required by DynamoDb SDK.  If this argument is a String, it should contain
   comma seperated names of properties to be deleted.  If its an Array, each
   array element should be a property  name to be deleted.

 * @return {Updates} Object with all update attributes in the chain.

See note: <a href="#duplicate_attr_name">duplicate attribute names</a>

<a name="example_put_add_delete"  />
### Example: `put`, `add`, `delete`

```js
var attrUpdate = require('dynamodb-data-types').AttributeValueUpdate;

var dataUpdate = attrUpdate
    .put({name: "foo"})
    .add({age: 1})
    .delete("height, nickname")
    .add({favColors: ["red"]})
    .delete({favNumbers: [3]});

console.log(JSON.stringify(dataUpdate));
// {
//   "name": { "Action": "PUT", "Value": { "S": "foo" } },
//   "age": { "Action": "ADD", "Value": { "N": "1" } },
//   "height": { "Action": "DELETE" },
//   "nickname": { "Action": "DELETE" },
//   "favColors": { "Action": "ADD", "Value": { "SS": ["red" ] } },
//   "favNumbers": { "Action": "DELETE", "Value": { "NS": ["3"] } }
// }
```

<a name="duplicate_attr_name"  />
### Note: Duplicate attribute names in `AttributeValueUpdate`

Each attribute name can appear only once in an `AttributeUpdates` object. This
is a feature of the AWS API.  However its easy to overlook this when chaining
`add`, `put` and `delete` updates.

For example, following is an attribute `colors` of type `SS` (String set)

```js
var item = {
    id: ...,
    colors: ["red", "blue"]
}
```

Now, we want to `delete` "red" and `add` "orange".

To add "orange", the `AttributeUpdates` object can be created as:
`attrUpdate.add({colors: ["orange"]})`

Similarly, to delete "red": `attrUpdate.delete({colors: ["red"]})`

However, both cannot be represented in the same `AttributeUpdates` object. The
following will not work as expected:

`attrUpdate.add({colors: ["orange"]}).delete({colors: ["red"]});`

This is because the action to `add` "orange" is overwritten by action to
`delete` "red". This is because `colors` is a property of the `AttrubuteUpdates` object.

The following code demonstrates the above note:

```js
JSON.stringify(attrUpdate.add({colors: ["orange"]}));
//{"colors":{"Action":"ADD","Value":{"SS":["orange"]}}}

JSON.stringify(attrUpdate.delete({colors: ["red"]}));
//{"colors":{"Action":"DELETE","Value":{"SS":["red"]}}}

// The below does not work as expected
JSON.stringify(attrUpdate.add({colors: ["orange"]}).delete({colors: ["red"]}));
//{"colors":{"Action":"DELETE","Value":{"SS":["red"]}}}

```

## The library does not perform checks.

It is upto the application to ensure that the application follows the SDK
requirements. This utility does not perform any checks.

For example, DynamoDB attribute value `NS` is meant to represents
a set of 
numbers. If, by mistake, the application creates the structure 
`{"NS":  [1, 3, "string"]}`, this utility will not detect that the third element
is an invalid element (string). Such checks are left to the application.


## Platform

This utility is designed for [node.js](http://nodejs.org).  For use in the
browser, it will need to be adapted. This is in lieu of the recent (October
2013) [Developer Preview - AWS SDK for JavaScript in the
Browser](http://aws.typepad.com/aws/2013/10/developer-preview-aws-sdk-for-javascript.html)

To adapt this utility for the browser, following are few todos. (This list is
not exhaustive)

 * Possible use of lodash or underscore to ensure browser compatibility of
   functions which iterate over objects.  Currently lib/util.js has a function
   to iterate over object properties which is sufficient for use with Node.js. 

## License

[License](https://github.com/kayomarz/dynamodb-data-types/blob/master/LICENSE)

