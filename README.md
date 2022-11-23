# dynamodb-data-types

[![Build Status](https://travis-ci.org/kayomarz/dynamodb-data-types.svg)](https://travis-ci.org/kayomarz/dynamodb-data-types)
[![Coverage Status](https://coveralls.io/repos/kayomarz/dynamodb-data-types/badge.svg?branch=master&service=github)](https://coveralls.io/github/kayomarz/dynamodb-data-types?branch=master)

A JavaScript utility to help represent DynamoDB data types and records.

**New** ver 4.0.0 of this library generates DynamoDB `UpdateExpression`. [updateExpr()](#updateExpr).

## Introduction

DynamoDB represents the JavaScript number `1` as `{N:'1'}`.

This utility helps convert between such representations.

```
 JavaScript             DynamoDB
------------------------------------------------
-1                {N: '-1'}
'Hello'           {S: 'Hello'}
true              {BOOL: true}
NULL              {NULL: true}
{a:1, b:''}       {M: {a: {N: '1'}, b: {S: ''}}}
```

## Getting Started

### `wrap`, `unwrap` to convert (marshall) JavaScript data.

```js
const attr = require('dynamodb-data-types').AttributeValue;

const data = {
  id: 10,
  food: ['Rice', 33, null],
  obj: {a:1, b:true},
};

const wrapped = attr.wrap(data); // wrap (marshall) data to use with DynamoDB
/* Returns:
 * {
 *   id:{N:"10"},
 *   food:{L:[{S:"Rice"},{N:"33"},{NULL:true}]},
 *   obj:{M:{a:{N:"1"},b:{BOOL:true}}}
 * } */

attr.unwrap(wrapped); // unwrap (unmarshall) data
/* Returns:
 * {
 *   id: 10,
 *   food: ['Rice', 33, null],
 *   obj: {a:1, b:true},
 * } */
```

Use `wrap1` and `unwrap1` for single primitive values, 

```js
attr.wrap1(50);         // { N: '50' }
attr.unwrap1({N:'50'}); // 50
```

<a name="updateExpr" id="updateExpr"></a>

### `updateExpr()` for DynamoDB `UpdateExpression`

Let's say you want to update `color` in a item or record. DynamoDB `UpdateItem`
API requires you to provide a `UpdateExpression` as follows:

```js
{
  UpdateExpression: "SET color = :a",
  ExpressionAttributeValues: {":a":{"S":"red"}}}
}
```

Instead of attribute `color`, if you want to update `year` to `2013` then you
have to do one more step because `year` is a reserved keyword:

```js
{
  UpdateExpression":"SET #A = :a",
  ExpressionAttributeValues: {":a":{S:"2013"}},
  ExpressionAttributeNames :{"#A":"year"}}
}
```

Use this library to generate the above for you as follows:

```js
const { updateExpr } = require('dynamodb-data-types');
updateExpr().set({ name: 'foo' }).expr();
```

Below is a more comprehensive example:

```js
const { updateExpr } = require('dynamodb-data-types');

updateExpr()             // Call updateExpr()
  .set({ a: 'foo' })     // chain multiple clauses
  .add({ n: 1 })
  .remove('rat', 'bat')
  .set({ sky: 'blue'})
  .delete({ day: ['Mon'] }) // 'day' is a reserved keyword
  .remove('hi')
  .expr(); // In the end expr() returns the UpdateExpression
// After .expr(), we cannot chain any more clauses (set,remove,add,delete)

/* Returns:
{
 * UpdateExpression: "SET a = :a, sky = :b REMOVE rat, bat, hi ADD n :c DELETE #A :d",
 * ExpressionAttributeValues: {":a":{S:"foo"},":b":{S:"blue"},":c":{N:"1"},":d":{SS:["Mon"]}},
 * ExpressionAttributeNames:{"#A":"day"}} // Because 'day' is a reserved keyword
 * } */
```

### `UpdateExpression` clauses `SET`, `REMOVE`, `ADD`, `DELETE`

`updateExpr().set()`, `remove()`, `add()`, `delete()`, are the same clauses
defined by DynamoDB `UpdateExpression`. Each clause is said to contain one or
more `action`. See [AWS
documentation](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.UpdateExpressions.html)
for more.

### `updateExpr()` handles DynamoDB reserved keywords.

*updateExpr()* avoids conflict with [keywords reserved by
DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html). To
demonstrate this, the below example uses the conflicting keyword `year`.

A more complete example:

```js
const { wrap } = require('dynamodb-data-types').AttributeValue;
const { updateExpr } = require('dynamodb-data-types');
const { DynamoDBClient, UpdateItemCommand, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const TableName = 'FooTable';
const client = new DynamoDBClient({ region: 'us-east-1' });

const updates = updateExpr()    // Call updateExpr()
      .set({ greet: 'Hello' })  // chain multiple clauses
      .remove('foo', 'city')
      .add({ age: 1 })
      .set({ nick: 'bar' })
      .remove('baz')
      .delete({ year: [2008] }) // 'year' is a reserved keyword
      .add({ amt: 1.5 });

// Use expr() to get the UpdateExpression data structures
const { UpdateExpression,  ExpressionAttributeValues, ExpressionAttributeNames } = updates.expr();

// After .expr(), we cannot chain any more clauses (set,remove,add,delete)

/* Generated data structures:
 * {
 *   UpdateExpression:
 *    'SET greet = :a, nick = :b REMOVE foo, baz ADD age :c, amt :d DELETE #A :e',
 *
 *   ExpressionAttributeValues: {
 *     ':a': { S: 'Hello' },
 *     ':b': { S: 'bar' },
 *     ':c': { N: '1' },
 *     ':d': { N: '1.5' },
 *     ':e': { NS: [Array] }
 *   },
 *
 *   ExpressionAttributeNames: { '#A': 'year' } // Because year is a reserved keyword
 * }
 */

const params = {
  TableName,
  Key: wrap({ id: 10 }),
  UpdateExpression,
  ExpressionAttributeValues,
  ExpressionAttributeNames,
};

/* TIP: For shorter code, use ...updates.expr()
 * const params = {
 *   TableName,
 *   Key: wrap({ id: 10 }),
 *   ...updates.expr()
 * };
 */

client.send(new UpdateItemCommand(params));
```

#### `updateExpr()` avoids creating duplicate values

As demonstrated below, `updateExpr()` avoids creating duplicates in
`ExpressionAttributeValue` by using `===` internally.

```js

  /* Different action values across clauses.
   * Hence ExpressionAttributeValues has three items.
   */
  const expr0 = updateExpr()
        .set({ w: 1 })
        .set({ x: 2 })
        .add({ y: 3 })
        .expr();
  // {
  //   UpdateExpression: 'SET w = :a, x = :b ADD y :c',
  //   ExpressionAttributeValues: {
  //     ':a': { N: '1' },
  //     ':b': { N: '2' },
  //     ':c': { N: '3' },
  //   }
  // }


  /* Identical action values across clauses.
   * Hence ExpressionAttributeValues has only one item.
   */
  const expr1 = updateExpr()
        .set({ w: 1 })
        .set({ x: 1 })
        .add({ y: 1 })
        .expr();
  // {
  //   UpdateExpression: 'SET w = :a, x = :a ADD y :a',
  //   ExpressionAttributeValues: {
  //     ':a': { N: '1' }
  //   }
  // }
```

#### Roadmap TODO

To avoid duplicate values in ExpressionAttributeValues, apart from doing a
strict equality check using '===', allow a deep equality to avoid duplicates.

Below, value is the same array for all actions/clauses.
Hence there should be 1 entry in ExpressionAttributeValues.

However there are 3 entries.

It might be a good feature to do a deep equality and ensure 1 entry in ExpressionAttributeValues.

```js
  const expr0 = updateExpr()
        .set({ w: [1, 2, 3] })
        .set({ x: [1, 2, 3] })
        .set({ y: [1, 2, 3] })
        .expr();
  // {
  //   UpdateExpression: 'SET w = :a, x = :b, y = :c',
  //   ExpressionAttributeValues: {
  //     ':a': { NS: ['1', '2', '3'] },
  //     ':b': { NS: ['1', '2', '3'] },
  //     ':c': { NS: ['1', '2', '3'] },
  //   }
  // }
```

See
[examples/01-put-and-update-expression.js](examples/01-put-and-update-expression.js)
for full example of generated DynamoDB structures `UpdateExpression`,
`ExpressionAttributeValues`, `ExpressionAttributeNames`.



### Use with Node.js

Use with [AWS SDK for Node.js](https://aws.amazon.com/sdk-for-node-js/)

    npm install dynamodb-data-types


### Use in cli

Use with the cli for quick utility

    npm install -g dynamodb-data-types
    dynamo-dt-attr-wrap '{'hello':'world'}'
    dynamo-dt-attr-unwrap '{'hello': {'S': 'world'}}'

Pipe is also supported

    echo '{"hello":"world"}' | dynamo-dt-attr-wrap
    echo '{"hello": {"S": "world"}}' | dynamo-dt-attr-unwrap

### Use in the browser

Use with [AWS SDK for JS in the Browser](https://aws.amazon.com/sdk-for-browser/)

Download the browser version from [dist](dist).

See [examples/browser](examples/browser) and [this note](#browserNotes)


<a name="browserNotes" id="browserNotes"></a>

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

 + [examples/01-put-and-update-expression.js](examples/01-put-and-update-expression.js)
 + [examples/02-binary-image.js](examples/02-binary-image.js)
 + [examples/03-explicit-data-type.js](examples/03-explicit-data-type.js)
 + [examples/04-explicit-preserve-arrays.js](examples/04-explicit-preserve-arrays.js)
 + [examples/browser/dynamodb-data-types.html](examples/browser/dynamodb-data-types.html) 
 + [examples/depricated-01-put-update.js](examples/depricated-01-put-update.js)

## Features

Refer to
[docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Types.html](http://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Types.html)

DynamoDb-Data-Types supports:

 * AttributeValue
 * UpdateExpression
 * ExpressionAttributeValues
 * ExpressionAttributeNames
 * AttributeValueUpdate  ([Deprecated](README-deprecated.md) in favour of UpdateExpression)

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

const data = {
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
const data = {
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
  'polygon': {
    'M': {
      'quadrilateral': {
        'M': {
          'sides': {
            'N': '4'
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
    SS: ['abc','def'] 
  },
  nums: { 
    NS: ['123','456'] 
  },
  mix: {
    'L': [
      { N: '1' },
      { S: 'abc' },
      { BOOL: true },
      { BOOL: false },
      { NULL: true },
      { NS: ['1','2','3'] }
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

    const ddt = require('dynamodb-data-types');
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

### updateExpr() for DynamoDB `Update`

[AWS API Reference -
Update](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Update.html)
* UpdateExpression
* ExpressionAttributeValues
* ExpressionAttributeNames

See [updateExpr()](#updateExpr) above for detailed usage examples.

### AttributeValueUpdate (Depricated)

**Deprecated!** Use [updateExpr()](#updateExpr) instead.

  To use AttributeValueUpdate (Depricated) see [README-deprecated](README-deprecated.md)
  
## AttributeValue

<a name="wrap" id="wrap"></a>

### wrap(item[, options])

Wrap (marshall) JavaScript data into DynamoDB's AttributeValue data type.

#### Arguments

 * @param {Object} item The object to wrap.
 * @param {Object} options
 * @return {Object} A DynamoDB AttributeValue.

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
const attr = require('dynamodb-data-types').AttributeValue;
attr.wrap({name: 'Foo', age: 50});
// {'name':{'S':'Foo'},'age':{'N':'50'}}

attr.wrap({alphabets: ['a', 'b', 'c']});
// {'alphabets':{'SS': ['a','b','c']}}

attr.wrap({alphabets: ['a', 'b', 'c']}, {types: {alphabets:'L'}});
// {'alphabets':{'L': [{'S':'a'},{'S':'b'},{'S': 'c'}]}}
```

<a name="unwrap" id="unwrap"></a>

### unwrap(attributeValue)

Unwrap (unmarshall) DynamoDB AttributeValue to appropriate
JavaScript types.

#### Arguments

 * @param {Object} attributeValue The DynamoDB AttributeValue to unwrap.
 * @return {Object} Unwrapped object with properties.

__Example__

```javascript
const attr = require('dynamodb-data-types').AttributeValue;
attr.unwrap({'name':{'S':'Foo'},'age':{'N':'50'}});
// {name: 'Foo', age: 50}
```

<a name="wrap1" id="wrap1"></a>

### wrap1(value [, options])

Wrap a single value into DynamoDB's AttributeValue.

#### Arguments

 * @param {String|Number|Array} 
 * @param {Object} options Same as options for wrap().
 * @return {Object} DynamoDB AttributeValue.

__Example__

```javascript
const attr = require('dynamodb-data-types').AttributeValue;
attr.wrap1(50);    // {'N':'50'}
attr.wrap1('50');  // {'S':'50'}
```

<a name="unwrap1" id="unwrap1"/></a>

### unwrap1(attributeValue)

Unwrap a single DynamoDB's AttributeValue to a value of the appropriate
JavaScript type. 

#### Arguments

@param {Object} attributeValue The DynamoDB AttributeValue.
@return {String|Number|Array}  The JavaScript value.

__Example__

```javascript
const attr = require('dynamodb-data-types').AttributeValue;
attr.unwrap1({'N':'50'});  // 50
attr.unwrap1({'S':'50'});  // '50'

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

Note: Change log dates are yyyy-mm-dd.

## Version 4.0.1

2022-10-25

+ fix `updateExpr().remove()` so that it handles [reserved
  keywords](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html). This
  fixes [issue #18
  (github)](https://github.com/kayomarz/dynamodb-data-types/issues/18)

## Version 4.0.0

+ Introduce `updateExpr()` to generate DynamoDB `UpdateExpression` used to
  update an item.

2021-12-19

## Version 3.0.3

+ Update code examples and docs

Functionally, this version is identical to the previous 3.0.2

## Version 3.0.2

+ Update the `lodash` version (used for tests).

Functionally, this version is identical to the previous 3.0.1

## Version 3.0.1

+ Expose as a CLI utility thanks to @bneigher (github.com/bneigher).
    
Functionally, apart from the CLI utility, this version is identical to the
previous 3.0.0


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

## License

[License](https://github.com/kayomarz/dynamodb-data-types/blob/master/LICENSE)
