# DynamoDb-Data-Types

A utility for Amazon DynamoDB __data types__.

This utility is designed to be used along with the [Amazon SDK for
Node.js](http://aws.amazon.com/sdkfornodejs/). It helps represent
AWS DynamoDb data types.

Version **2.0.0** of DynamoDb-Data-Types was recently released (Feb 15 2015) with
a rewrite of file AttributeValue.js.  Incase you encounter any issues, please
[report them on github](https://github.com/kayomarz/dynamodb-data-types).

## How is it useful?

Following are some key-value pairs:

```js
var data = { 
  name: 'Java Script',
  age: 18,
  fav: {
    food: ['Rice', 'Noodles'],
    colors: ['Orange', 'Blue']
  },
  engines: [ 'Rhino', 'v8', 'SpiderMonkey', 'Carakan', 'JavaScriptCore' ]
}
```

In order to put the above data into DynamoDB, the AWS SDK requires it to be
represented as:

```
{
  "name": { "S": "Java Script" },
  "age": { "N": "18" },
  "fav": { 
    "M": {
      "food": { "SS": [ "Rice", "Noodles" ] },
      "colors": { "SS": ["Orange", "Blue" ] }
    }
  },
  "engines": { "SS": ["Rhino", "v8", "SpiderMonkey", "Carakan", "JavaScriptCore" ] }
}
```

This utility helps to construct such representations required by the __AWS SDK
for Node.js__ 

To represent the above `var data` as a DynamoDB `AttributeValue` do:

```js
var attr = require('dynamodb-data-types').AttributeValue;
attr.wrap(data);
// {
//   "name": { "S": "Java Script" },
//   "age": { "N": "18" },
//   "fav": { 
//     "M": {
//       "food": { "SS": [ "Rice", "Noodles" ] },
//       "colors": { "SS": ["Orange", "Blue" ] }
//     }
//   },
//   "engines": { "SS": ["Rhino", "v8", "SpiderMonkey", "Carakan", "JavaScriptCore" ] }
// }
```

## Quick Examples

```js
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
 + [examples/02-binary-image.js](https://github.com/kayomarz/dynamodb-data-types/blob/master/examples/02-binary-image.js)

## Features

Refer to
[docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Types.html](http://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Types.html)

DynamoDb-Data-Types supports:

 * AttributeValue
 * AttributeValueUpdate


## Supported AttributeValue types

Refer to
[docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_AttributeValue.html](http://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_AttributeValue.html)

DynamoDb-Data-Types supports:

 + B
 + BOOL
 + BS
 + L
 + M
 + N
 + NS
 + NULL
 + S
 + SS

## wrapping data

Its trivial to detect `N`, `NS`, `S`, `SS`, `NULL` and `BOOL`.  The other types
`M`, `L`, `B`, `BS` are not difficult but need some explaining.

For any a given value `val`, `wrap()` detects the AWS Data types as follows:

### BOOL, NULL, N, S

How `wrap()` detects them (psuedo-code):

    IF val is typeof boolean
        THEN detect as type BOOL
    ELSE IF val is null
        THEN detect as type NULL
    ELSE IF val is typeof number or if val instanceof Number
        THEN detect as type N
    ELSE IF val is typeof string or if val is instanceof String
        THEN detect as type S

### B

How `wrap()` detects type `B` (psuedo-code):

    IF val is instanceof Buffer
        THEN detect as type B

There maybe other type which should get detected as `B`. Please let me know if
you have suggestions.

### M

How `wrap()` detects type `M` (psuedo-code):

    IF (val is none of: BOOL, NULL, N, S, B)
        AND (typeof val === 'object')
            THEN detect as type M
    ELSE
        wrap() ignores val

### NS, SS, BS, L

When `wrap()` sees an Array, here's what it does (psuedo-code):

    IF val is an Array
        IF (every element in Array is type N)
            THEN detect as type NS
        ELSE IF (every element in Array is type S)
            THEN detect as type SS
        ELSE IF (every element in Array is type B)
            THEN detect as type BS
        ELSE 
            detect as type L


## Download

The source is available for download from
[github.com/kayomarz/dynamodb-data-types](https://github.com/kayomarz/dynamodb-data-types).

To install using Node Package Manager (npm):

    npm install dynamodb-data-types


## What's new in version 2.0.0

DynamoDb-Data-Types version 2.0.0 introduces support for **AttributeValue**
types `BOOL`, `NULL`, `M`, `L`.


### Use of `M` for nested data

DynamoDb-Data-Types uses `M` to nest objects. Consider the following data:

```js
var data = {
  polygon: {
    quadrilateral: {
        sides: 4
    }
  }
}
```

`wrap()` represents the above data as follows:

```js
{
  "polygon": {
    "M": {
      "quadrilateral": {
        "M": {
          "sides": {
            "N": "4"
          }
        }
      }
    }
  }
}
```

### Use of `L` for arrays

DynamoDb-Data-Types uses `L` to represent mixed arrays. Consider the following data:

```js
{
  strs: ['abc', 'def'],
  nums: [123, 456],
  mix: [1, 'abc', true, false, null, [1,2,3]]
}
```

`wrap()` represents the above data as follows:

```js
{
  strs: { 
    SS: ["abc","def"] 
  },
  nums: { 
    NS: ["123","456"] 
  },
  mix: {
    "L": [
      { N: "1" },
      { S: "abc" },
      { BOOL: true },
      { BOOL: false },
      { NULL: true },
      { NS: ["1","2","3"] }
    ]
  }
}
```

### Older versions of DynamoDb-Data-Types

Read this only if you need DynamoDb-Data-Types version **1.0.0** or below.

If you are already using version **1.0.0** or **0.2.7** you may continue to do
so.

If you are using DynamoDb-Data-Types version **1.0.0** or **0.2.7**, wrapping / unwrapping `B` and `BS` will not work when used with **AWS SDK 1.x.x**
but should automagically work with **AWS SDK 2.x.x.** although it has not been
tested. This is related to automatic conversion of base64 done by AWS SDK
version 2.x. See
[AWS Upgrading Notes (1.x to 2.0)](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/upgrading.html). 


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

Unwrap DynamoDB AttributeValue to values of the appropriate types.

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
attr.wrap1(50);    // {"N":"50"}
attr.wrap1("50");  // {"S":"50"}
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
attr.unwrap1({"N":"50"});  // 50
attr.unwrap1({"S":"50"});  // "50"

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

Each attribute name can appear only once in the `AttributeUpdates` object of the
`itemUpdate` call. This is a feature of the AWS API.  However its easy to
overlook this when chaining `add`, `put` and `delete` updates.

For example, following is an attribute `colors` of type `SS` (String set)

```js
var item = {
    id: ...,
    colors: ["red", "blue"]
}
```

Suppose, we want to `delete` "red" and `add` "orange".

To add "orange", the `AttributeUpdates` object is created as:
`attrUpdate.add({colors: ["orange"]})`. Similarly, to delete "red" the
`AttributeUpdates` object is created as `attrUpdate.delete({colors: ["red"]})`

However, both actions cannot be represented in the same `AttributeUpdates`
object.

```js
// Will not work as expected
attrUpdate.add({colors: ["orange"]}).delete({colors: ["red"]});
```

The action to `delete` "red" overwrites the action to `add` "orange". This is
simply because `colors` is a property of the `AttrubuteUpdates` object.

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


## Platform

This utility is designed for Node.js.  For use in the
browser, it will need to be adapted. This is in lieu of the October
2013 [Developer Preview - AWS SDK for JavaScript in the
Browser](http://aws.typepad.com/aws/2013/10/developer-preview-aws-sdk-for-javascript.html)

To adapt this utility for the browser, following are few todos. (This list is
not exhaustive)

 * Ensure browser compatibility of functions which iterate over objects.
   Currently lib/util.js has a function to iterate over object properties which
   is sufficient for use with Node.js.
 * Browser compatible ways to detect array Array.
 * Ways to detect binary data commonly used by browser applications. For
   instance, currently for Node.js, `wrap()` detects `Buffer` as binary type
   `B`.

# Change log

## Version 2.0.1

2015-02-15

 + Fixed README
 + Committed modified package.json (just realised it wasn't committed)

## Version 2.0.0 

2015-02-15

 + Implemnted `M`
 + Implemented `L`
 + Added example to put and get binary data (examples/02-binary-image.js)

## Version 1.0.0 

2015-02-11

**Note:** There are no source code changes in version 1.0.0.  Functionally,
1.0.0 is identical to 0.2.7.

  + Bumped from version 0.2.7 to version 1.0.0.
  + Update documentation especially with regard to `B` and `BS` data types.
  + Added development deps into pacakge.json instead of tests/package.json
    (It should have been this way to begin with)

Note: Change log dates are yyyy-mm-dd.

## License

[License](https://github.com/kayomarz/dynamodb-data-types/blob/master/LICENSE)
