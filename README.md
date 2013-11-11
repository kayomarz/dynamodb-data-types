# DynamoDb-Data-Types

A utility for Amazon DynamoDB __Data Types__ for AWS SDK for Node.js.

This utility is designed to be used in complement with the [Amazon SDK for
Node.js]((http://aws.amazon.com/sdkfornodejs/). It helps in representing
Amazon DybamoDb data types.

## How is it useful?

For example, following are some key-value pairs:

```js
var data = { 
    name: "Java Script",
    age: 18, 
    engines: ["Rhino", "v8", "Carakan", "JavaScriptCore"]
}
```

In order to put the above data into DynamoDB, the AWS SDK requires it to be
represented as:

```
{
    name: { S: 'Java Script' },
    age: { N: '18' },
    engines: { SS: [ 'Rhino', 'v8', 'Carakan', 'JavaScriptCore' ] } 
}
```

This utility helps to construct such representations required by the __AWS SDK
for Node.js__ 

```js
var attr = require('dynamodb-data-types').AttributeValue;
attr.wrap(data);
```

## Features

The following data types are supported.

 * AttributeValue
 * AttributevalueUpdate

List of DynamoDB data types: [docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Types.html](http://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Types.html)


## Quick Examples

```javascript
var attr = require('dynamodb-data-types').AttributeValue;
var attrUpdate = require('dynamodb-data-types').AttributeValueUpdate;

var infoAttrValue = attr.wrap({ name: "Foo", age: 50 });
console.log(JSON.stringify(infoAttrValue));
// {"name":{"S":"Foo"},"age":{"N":"50"}}

var experience = {count: 4, languages: ["Java Script", "Ruby", "GLSL", "C"]};
console.log(JSON.stringify(wrap(experience)));
// {"count":4,"languages":["Java Script","Ruby","GLSL","C"]}
```

## More examples

 + [examples/01-put-update.js](https://github.com/kayomarz/dynamodb-data-types/blob/master/examples/01-put-update.js)


## Download

The source is available for download from
[github.com/kayomarz/dynamodb-data-types](https://github.com/kayomarz/dynamodb-data-types).

To install using Node Package Manager (npm):

    npm install dynamodb-data-types


## Platform

This utility is designed for [node.js](http://nodejs.org). If required, it may
be adapted for use with the browser.

[See the October 2013 Developer Preview - AWS SDK for JavaScript in the
Browser](http://aws.typepad.com/aws/2013/10/developer-preview-aws-sdk-for-javascript.html)

To adapt this utility for the browser, following are few todos. (This list is
not exhaustive)

 * Possible use of lodash or underscore to ensure browser compatibility of
   functions which iterate over objects.  Currently lib/util.js has a function
   to iterate over object properties which is sufficient for use with Node.js. 


## Untested feature

The current version of this library has not been tested with binary types `B`
and `BS`.  __These will be done someime soon__.

PS: Please feel free to share any working code you might have to put/get binary
data - it would help me complete these tests.


## Documentation

### AttributeValue

* [wrap](#wrap)
* [unwrap](#unwrap)
* [wrap1](#wrap1)
* [unwrap1](#unwrap1)

### AttributeValueUpdate

* [put](#put)
* [add](#add)
* [delete](#delete)

## AttributeValue

<a name="wrap"  />
### wrap(item)

Wrap object properties into DynamoDB's AttributeValue data type.

__Arguments__

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

__Arguments__

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

__Arguments__

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

__Arguments__

@param {Object} attributeValue The DynamoDB AttributeValue.
@return {String|Number|Array}  The javascript value.

__Example__

```javascript
var attr = require('dynamodb-data-types').AttributeValue;
attr.unwrap1({"N":"50"});
// 50
```


## AttributeValue

<a name="add"  />

### add(attrs)

Append attributes to be updated with action "ADD".
This function can be chained with further calls to `add', `put' or `delete'.

__Arguments__

 * @param {Object} attrs Object with attributes to be updated.
 * @return {Updates} Object with all update attributes in the chain.


<a name="put"  />

### put(attrs)

Append attributes to be updated with action "PUT".
This function can be chained with further calls to `add', `put' or `delete'.

__Arguments__

 * @param {Object} attrs Object with attributes to be updated.
 * @return {Updates} Object with all update attributes in the chain.


<a name="delete"  />

### delete(attrs)

Append attributes to be updated with action "DELETE".
This function can be chained with further calls to `add', `put' or `delete'.

__Arguments__

 * @param {Object|String|Array} attrs If this argument is an an Object,the
   Object's property values must be an array, containing elements to be removed,
   as required by DynamoDb SDK.  If this argument is a String, it should contain
   comma seperated names of properties to be deleted.  If its an Array, each
   array element should be a property  name to be deleted.

 * @return {Updates} Object with all update attributes in the chain.


## The library does not perform checks.

It is upto the application to ensure that the application follows the SDK
requirements. This utility does not perform any checks.

For example, DynamoDB attribute value `NS` is meant to represents
a set of 
numbers. If, by mistake, the application creates the structure 
`{"NS":  [1, 3, "string"]}`, this utility will not detect that the third element
is an invalid element (string). Such checks are left to the application.


## License

[License](https://github.com/kayomarz/dynamodb-data-types/blob/master/LICENSE)

