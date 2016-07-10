# DynamoDb-Data-Types

[![Build Status](https://travis-ci.org/kayomarz/dynamodb-data-types.svg)](https://travis-ci.org/kayomarz/dynamodb-data-types)
[![Coverage Status](https://coveralls.io/repos/kayomarz/dynamodb-data-types/badge.svg?branch=master&service=github)](https://coveralls.io/github/kayomarz/dynamodb-data-types?branch=master)

This utility helps represent AWS DynamoDb data types. It converts
JavaScript objects into objects as required by DynamoDb.

For example, following is some JavaScript data:

```js
var data = {
  fruit: 'Apple',
  count: 12
}
```

The DynamoDB SDK requires it to be represented as:

```json
 {
    "fruit": {
      "S": "Apple"
    },
    "count": {
      "N": "12"
    }
  }
```

Use `wrap` and `unwrap` to convert objects form one form into the other.

## Quick Example

```js
var attr = require('dynamodb-data-types').AttributeValue;

var data = {
  id: 10,
  food: ['Rice', 'Noodles'],
  age: 1,
  isThatYou: true,
  stuff: ['Tomato', 33],
  day: 'Tuesday'
};

// wrap: marshall data into the format required by DynamoDb.
var dynamodbData = attr.wrap(data);
// {
//   "id": {"N": "10"},
//   "food": {"SS": ["Rice", "Noodles"] },
//   "age": {"N": "1"},
//   "isThatYou": {"BOOL": true},
//   "stuff": {"L": [{"S": "Tomato"}, {"N": "33"}]},
//   "day": {"S": "Tuesday"}
// }

// unwrap: unmarshall data back to the orignal.
var unwrapped = attr.unwrap(dynamodbData);
// {
//   "id": 10,
//   "food": ["Rice", "Noodles"],
//   "age": 1,
//   "isThatYou": true,
//   "stuff": ["Tomato", 33],
//   "day": "Tuesday"
// }

// Helper for working with DynamoDb update ('updateItem'):
var attrUpdate = require('dynamodb-data-types').AttributeValueUpdate;
var dataUpdates = attrUpdate
      .put({game: "Football"})
      .add({age: 1})
      .delete("day");
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
```

The above example does not commnicate with a DynamoDb instance. It only
demonstrates how to wrap / unwrap data.  There are more examples below.

Incase you need to wrap/unwrap individual values, use `wrap1` and `unwrap1`:

```js
console.log(attr.wrap1(50));
//{ N: '50' }

console.log(attr.unwrap1({"N":"50"}));
//50
```

### Use with Node.js

Use with [AWS SDK for Node.js](https://aws.amazon.com/sdk-for-node-js/)

    npm install dynamodb-data-types

### Use in the browser

Use with [AWS SDK for JS in the Browser](https://aws.amazon.com/sdk-for-browser/)

Download the browser version from [dist](dist).

See [examples/browser](examples/browser) and [this note](#browserNotes)


<a name="browserNotes"></a>

## Notes for use in the browser

The browser version of this library (created using
[browserify](http://browserify.org/)) has not been tested. Pull
requests to add tests for the browser are welcome (maybe using phantom.js?).

The browser version is available from version `2.1.2` onwards.


### File size of the browser version

The browser version of this library is generated using
[Browserify](http://browserify.org/).

For versions `3.0.0` onwards of this library, `browserify` is made to exclude
`Buffer` related code. It is less likely for a browser side application to make
use of `Buffer` as a binary type.

If you don't need detailed info about this, skip the next paragraph.

This library uses node's [Buffer](https://nodejs.org/api/buffer.html) for
recognizing binary types. By default, browserify, includes external `Buffer`
related code, causing the filesize of the browser dist to become 5.4
times larger (6x if you compare `min.js` files). Version `3.0.0` onwards,
browserify is made to exclude `Buffer` related code because it seems less
likely for browser side code to detect `Buffer` as a binary type. Incase your
browser application does require `Buffer` you might try using
[dist-with-buffer](dist-with-buffer)


## Examples

 + [examples/01-put-update.js](examples/01-put-update.js)
 + [examples/02-binary-image.js](examples/02-binary-image.js)
 + [examples/03-explicit-data-type.js](examples/03-explicit-data-type.js)
 + [examples/04-explicit-preserve-arrays.js](examples/04-explicit-preserve-arrays.js)
 + [examples/browser/dynamodb-data-types.html](examples/browser/dynamodb-data-types.html) 

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

## preserveArrays

(New in version 2.1.0)

Consider the following:

```javascript

var data = {
  alphabets: ['c', 'a', 'b', 'c']
};

```

`wrap(data)` detects `alphabets` as `SS`. Being a set `SS` has two properties unlike those of arrays :

 + The order of elements is not preserved.
 + Duplicate elements are not allowed.

Starting with version **2.1.0**, you can do:

 + `wrap(data, {types: {alphabets: 'L'} }` to explicitly tell wrap to treat it `L` instead of the auto-detected `SS`. Similarly for `put()` and `add()`
 + Alternatively, call `preserveArrays()` to consider all arrays as type `L`. This has a global effect.

Read the documentation and examples for more.


## Support for `BOOL`, `NULL`, `M`, `L`

(new in version 2.0.0)

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

`wrap()` maps the above data as:

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

`wrap()` maps the above data as:

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

## Detecting data types

It is straightforward to detect types `N`, `NS`, `S`, `SS`, `NULL` and `BOOL`.
To detect other types - `M`, `L`, `B`, `BS` - simple rules are applied as
explained below.

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

There maybe other types which should get detected as `B`. Please let me know if
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


## API - Reference documentation

### Global settings

#### preserveArrays()

If `preserveArrays()` is called, all arrays found in the object being wrapped
are given type `L`. In other words, arrays will no longer get detected as `NS`,
`SS` or `BS` but specified as `L`.

This is useful to preserve duplicates and the order of elements in arrays.

    var ddt = require('dynamodb-data-types');
    ddt.preserveArrays();

This function is designed to be called once - It has a global effect.

If this is not needed on a global level, a similar effect can be achieved using
`options` parameter passed to `wrap()`, `wrap1()` and `put()` and `add()`.

Similarly, the global behaviour of `preserveArrays()` may be overridden using
the `options` object passed to  `wrap()`, `wrap1()` and `put()` and `add()`.


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

<a name="wrap"></a>

### wrap(item[, options])

Wrap (marshall) JavaScript data into DynamoDB's AttributeValue data type.

#### Arguments

 * @param {Object} item The object to wrap.
 * @param {Object} options
 * @return {Object} A DynamoDb AttributeValue.

##### Options

* `types`: An object containing attribute names and explicit type for that
attribute. Currently explicit type can only be specified if the detected type is
an array. Possible values are `'NS'`, `'SS'`, `'BS'`, `'L'`

Example of an options object:

```javascript
// Any property named 'randomList' found in the object (at any depth) is
// specified as 'NS'. This explicit type can be assigned only if `randomList` is
// detected as an array.

// Similarly if 'orderedList' is an array, it gets specified as type 'L'

{
  types: {
     randomList: 'NS', 
     orderedList: 'L'
  }
}
```



__Example__

```javascript
var attr = require('dynamodb-data-types').AttributeValue;
attr.wrap({name: "Foo", age: 50});
// {"name":{"S":"Foo"},"age":{"N":"50"}}

attr.wrap({alphabets: ["a", "b", "c"]});
// {"alphabets":{"SS": ["a","b","c"]}}

attr.wrap({alphabets: ["a", "b", "c"]}, {types: {alphabets:"L"}});
// {"alphabets":{"L": [{"S":"a"},{"S":"b"},{"S": "c"}]}}
```

<a name="unwrap"></a>

### unwrap(attributeValue)

Unwrap (unmarshall) DynamoDB AttributeValue to appropriate
JavaScript types.

#### Arguments

 * @param {Object} attributeValue The DynamoDb AttributeValue to unwrap.
 * @return {Object} Unwrapped object with properties.

__Example__

```javascript
var attr = require('dynamodb-data-types').AttributeValue;
attr.unwrap({"name":{"S":"Foo"},"age":{"N":"50"}});
// {name: "Foo", age: 50}
```

<a name="wrap1"></a>

### wrap1(value [, options])

Wrap a single value into DynamoDB's AttributeValue.

#### Arguments

 * @param {String|Number|Array} 
 * @param {Object} options Same as options for wrap().
 * @return {Object} DynamoDB AttributeValue.

__Example__

```javascript
var attr = require('dynamodb-data-types').AttributeValue;
attr.wrap1(50);    // {"N":"50"}
attr.wrap1("50");  // {"S":"50"}
```

<a name="unwrap1"/></a>

### unwrap1(attributeValue)

Unwrap a single DynamoDB's AttributeValue to a value of the appropriate
JavaScript type. 

#### Arguments

@param {Object} attributeValue The DynamoDB AttributeValue.
@return {String|Number|Array}  The JavaScript value.

__Example__

```javascript
var attr = require('dynamodb-data-types').AttributeValue;
attr.unwrap1({"N":"50"});  // 50
attr.unwrap1({"S":"50"});  // "50"

```

## AttributeValueUpdate

<a name="add"></a>

### add(attrs [, options])

Append attributes to be updated with action "ADD".
This function can be chained with further calls to `add`, `put` or `delete`.

#### Arguments

 * @param {Object} attrs Object with attributes to be updated.
 * @param {Object} options Same as options for wrap().
 * @return {Updates} Object with all update attributes in the chain.

<a href="#example_put_add_delete">Example - put, add, delete.</a>

See note: <a href="#duplicate_attr_name">duplicate attribute names</a>

<a name="put"></a>

### put(attrs [, options])

Append attributes to be updated with action "PUT".
This function can be chained with further calls to `add`, `put` or `delete`.

#### Arguments

 * @param {Object} attrs Object with attributes to be updated.
 * @param {Object} options Same as options for wrap().
 * @return {Updates} Object with all update attributes in the chain.

<a href="#example_put_add_delete">Example - put, add, delete.</a>

See note: <a href="#duplicate_attr_name">duplicate attribute names</a>

<a name="delete"></a>

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

<a name="example_put_add_delete"></a>
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

<a name="duplicate_attr_name"></a>
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

## Older versions of DynamoDb-Data-Types

Read this only if you need DynamoDb-Data-Types version **1.0.0** or below.

If you are already using version **1.0.0** or **0.2.7** you may continue to do
so.

If you are using DynamoDb-Data-Types version **1.0.0** or **0.2.7**, wrapping / unwrapping `B` and `BS` will not work when used with **AWS SDK 1.x.x**
but should automagically work with **AWS SDK 2.x.x.** although it has not been
tested. This is related to automatic conversion of base64 done by AWS SDK
version 2.x. See
[AWS Upgrading Notes (1.x to 2.0)](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/upgrading.html). 


# Change log

## Version 3.0.0

+ For Node users, version `3.0.0` is identical to `2.1.6`
+ For browser side version of this library
  - In version `3.0.0` onwards `Buffer` related code has been excluded.
  - Filesize of the `min.js` version is now `6.5KB`. Earlier it was `40KB`.

## Version 2.1.2 - 2.1.6

+ Added/fixed tests to imporve coverage.
+ Reviewed docs.

Source code of versions 2.1.2 to 2.1.6 are identical to 2.1.1.

## Version 2.1.2

This version is identical to 2.1.1 with no changes to code.
It only includes a JS build for the browser plus a few more tests.

 + Use browserify to create a dist for use in the browser.
 + Updated tests, use travis-ci, coverage, istanbul, .jshintrc.

## Version 2.1.1

2015-12-18

 + Replace functions deprecated by Node.

## Version 2.1.0

2015-08-17

 + Call `preserveArrays()` to use type `L` for array types; this preserves order of array elements and allows duplicate array elements both of which are not possible using sets `SS`, `NS` or `BS`
 + If not required on a global scale (calling preserveArrays), explicity set array types by passing opts to `wrap()`, `add()`, `put()`

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

## version 0.2.7

2014-01-29

## version 0.2.6

2013-11-15

## version 0.2.5

2013-11-11


Note: Change log dates are yyyy-mm-dd.

## License

[License](https://github.com/kayomarz/dynamodb-data-types/blob/master/LICENSE)
