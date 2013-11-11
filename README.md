# DynamoDb-Data-Types

Wrapper utility for Amazon DynamoDb data types for use with AWS SDK for Node.js.

This utility helps converting between data types types required by DybamoDb.
The utility does not check to ensure the application follows the SDK
requirements. For example, DynamoDB attribute value `NS' represents a set of
numbers. If the application mistakedly creates the structure 
`{"NS":  [1, 3, "string"]`, the utility will not detect that the 3rd element
is an invalid element because it is not a number.  Such checking is left to the application.

It is designed for use with [node.js](http://nodejs.org) but can be adapted for
use in the browser as per the recent AWS SDK preview for Javascript in the
browser.

As of now, use of this library for binary types `B' and `BS' are not supported
tested. If you can provide working code which puts / gets binrary data from
DynamoDb, it would help me to add binary support into this library.

## Quick Examples

```javascript
var attr = require('dynamodb-data-types').AttributeValue;
var attrUpdate = require('dynamodb-data-types').AttributeValueUpdate;

var info = { name: "Foo", age: 50 };
var infoAttrValue = attr.wrap(info);

console.log(JSON.stringify(infoAttrValue));
// {"name":{"S":"Foo"},"age":{"N":"50"}}

var resume = {count: 4, languages: ["Java Script", "Ruby", "GLSL", "C"]};

console.log(JSON.stringify(wrap(resume)));
// {"count":4,"languages":["Java Script","Ruby","GLSL","C"]}

```

## More examples

 + [examples/01-put-update.js](https://github.com/kayomarz/dynamodb-data-types/blob/master/examples/01-put-update.js)


## Download

The source is available for download from
[GitHub](https://github.com/kayomarz/dynamodb-data-types).

To install using Node Package Manager (npm):

    npm install dynamodb-data-types

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
@param {Object} item The object to wrap.
@return {Object} A DynamoDb AttributeValue.

__Example__

```javascript
var attr = require('dynamodb-data-types').AttributeValue;
attr.wrap({name: "Foo", age: 50});
// {"name":{"S":"Foo"},"age":{"N":"50"}}
```

<a name="unwrap"  />

### unwrap(attributeValue)

Unwrap DynamoDB AttributeValues to values of the appropriate types.
@param {Object} attributeValue The DynamoDb AttributeValue to unwrap.
@return {Object} Unwrapped object with properties.

__Example__

```javascript
var attr = require('dynamodb-data-types').AttributeValue;
attr.unwrap({"name":{"S":"Foo"},"age":{"N":"50"}});
// {name: "Foo", age: 50}
```

<a name="wrap1"  />

### wrap1(value)

Wrap a single value into DynamoDB's AttributeValue.
@param {String|Number|Array} 
@return {Object} DynamoDB AttributeValue.

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
@param {Object} attrs Object with attributes to be updated.
@return {Updates} Object with all update attributes in the chain.


<a name="put"  />

### put(attrs)

Append attributes to be updated with action "PUT".
This function can be chained with further calls to `add', `put' or `delete'.
@param {Object} attrs Object with attributes to be updated.
@return {Updates} Object with all update attributes in the chain.


<a name="delete"  />

### delete(attrs)

Append attributes to be updated with action "DELETE".
This function can be chained with further calls to `add', `put' or `delete'.
@param {Object|String|Array} attrs If this argument is an an Object,
the Object's property values must be an array, containing elements to be
removed, as required by DynamoDb SDK. 
If this argument is a String, it should contain comma seperated names of
properties to be deleted.  If its an Array, each array element should be a
property  name to be deleted.
@return {Updates} Object with all update attributes in the chain.


[License](https://github.com/kayomarz/dynamodb-data-types/blob/master/LICENSE)

