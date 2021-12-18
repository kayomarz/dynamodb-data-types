# Deprecated

The below documentation refers to use of depricated functionality.

DynamoDB `AttributeUpdates` is deprecated in favor of `UpdateExpression`.

**dynamodb-data-types** `attrUpdate()` is deprecated in favour of [updateExpr()](Readme.html#updateExpr)`

__Example__

### `attrUpdate` - for DynamoDB `AttributeUpdates` (Deprecated)

`dynamodb-data-types` *attrUpdate()* generates
[AttributeUpdates](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/LegacyConditionalParameters.AttributeUpdates.html)
which is a
[legacy](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/LegacyConditionalParameters.html)
parameter.

```js
const attrUpdate = require('dynamodb-data-types').AttributeValueUpdate;
const dataUpdates = attrUpdate
      .put({game: 'Football'})
      .add({age: 1})
      .delete('day');
// {
//   game: {
//     Action: 'PUT',
//     Value: {S: 'Football'}
//   },
//   age: {
//     Action: 'ADD',
//     Value: {N: '1'}
//   },
//   day: {
//     Action: 'DELETE'
//   }
// }
```

## API - Reference documentation

### AttributeValueUpdate (Depricated)

[AWS API Reference -
AttributeValueUpdate](http://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_AttributeValueUpdate.html) 

* [put](#put)
* [add](#add)
* [delete](#delete)

## AttributeValueUpdate

**Deprecated!** Use [updateExpr()](Readme.md#updateExpr) instead.

<a name="add"></a>

### add(attrs [, options])

**Deprecated!** Use [updateExpr()](Readme.md#updateExpr) instead.

Append attributes to be updated with action 'ADD'.
This function can be chained with further calls to `add`, `put` or `delete`.

#### Arguments

 * @param {Object} attrs Object with attributes to be updated.
 * @param {Object} options Same as options for wrap().
 * @return {Updates} Object with all update attributes in the chain.

<a href="#example_put_add_delete">Example - put, add, delete.</a>

See note: <a href="#duplicate_attr_name">duplicate attribute names</a>

<a name="put"></a>

### put(attrs [, options])

**Deprecated!** Use [updateExpr()](Readme.md#updateExpr) instead.

Append attributes to be updated with action 'PUT'.
This function can be chained with further calls to `add`, `put` or `delete`.

#### Arguments

 * @param {Object} attrs Object with attributes to be updated.
 * @param {Object} options Same as options for wrap().
 * @return {Updates} Object with all update attributes in the chain.

<a href="#example_put_add_delete">Example - put, add, delete.</a>

See note: <a href="#duplicate_attr_name">duplicate attribute names</a>

<a name="delete"></a>

### delete(attrs)

**Deprecated!** Use [updateExpr()](Readme.md#updateExpr) instead.

Append attributes to be updated with action 'DELETE'.
This function can be chained with further calls to `add`, `put` or `delete`.

#### Arguments

 * @param {Object|String|Array} attrs If this argument is an an Object,the
   Object's property values must be an array, containing elements to be removed,
   as required by DynamoDB SDK.  If this argument is a String, it should contain
   comma seperated names of properties to be deleted.  If its an Array, each
   array element should be a property  name to be deleted.

 * @return {Updates} Object with all update attributes in the chain.

See note: <a href="#duplicate_attr_name">duplicate attribute names</a>

<a name="example_put_add_delete"></a>
### Example: `put`, `add`, `delete`

**Deprecated!** Use [updateExpr()](Readme.md#updateExpr) instead.

```js
const attrUpdate = require('dynamodb-data-types').AttributeValueUpdate;

const dataUpdate = attrUpdate
    .put({name: 'foo'})
    .add({age: 1})
    .delete('height, nickname')
    .add({favColors: ['red']})
    .delete({favNumbers: [3]});

console.log(JSON.stringify(dataUpdate));
// {
//   'name': { 'Action': 'PUT', 'Value': { 'S': 'foo' } },
//   'age': { 'Action': 'ADD', 'Value': { 'N': '1' } },
//   'height': { 'Action': 'DELETE' },
//   'nickname': { 'Action': 'DELETE' },
//   'favColors': { 'Action': 'ADD', 'Value': { 'SS': ['red' ] } },
//   'favNumbers': { 'Action': 'DELETE', 'Value': { 'NS': ['3'] } }
// }
```

<a name="duplicate_attr_name"></a>
### Note: Duplicate attribute names in `AttributeValueUpdate`

**Deprecated!** Use [updateExpr()](Readme.md#updateExpr) instead.

Each attribute name can appear only once in the `AttributeUpdates` object of the
`itemUpdate` call. This is a feature of the AWS API.  However its easy to
overlook this when chaining `add`, `put` and `delete` updates.

For example, following is an attribute `colors` of type `SS` (String set)

```js
const item = {
    id: ...,
    colors: ['red', 'blue']
}
```

Suppose, we want to `delete` 'red' and `add` 'orange'.

To add 'orange', the `AttributeUpdates` object is created as:
`attrUpdate.add({colors: ['orange']})`. Similarly, to delete 'red' the
`AttributeUpdates` object is created as `attrUpdate.delete({colors: ['red']})`

However, both actions cannot be represented in the same `AttributeUpdates`
object.

```js
// Will not work as expected
attrUpdate.add({colors: ['orange']}).delete({colors: ['red']});
```

The action to `delete` 'red' overwrites the action to `add` 'orange'. This is
simply because `colors` is a property of the `AttrubuteUpdates` object.

The following code demonstrates the above note:

```js
JSON.stringify(attrUpdate.add({colors: ['orange']}));
//{'colors':{'Action':'ADD','Value':{'SS':['orange']}}}

JSON.stringify(attrUpdate.delete({colors: ['red']}));
//{'colors':{'Action':'DELETE','Value':{'SS':['red']}}}

// The below does not work as expected
JSON.stringify(attrUpdate.add({colors: ['orange']}).delete({colors: ['red']}));
//{'colors':{'Action':'DELETE','Value':{'SS':['red']}}}

```
