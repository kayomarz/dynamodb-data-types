/* This example demonstrates use of reconcileFn
 * Run this example on the command line as follows:
 * $ node 05-reconcile-data.js
 */

var dynamoDdDataTypes = require('dynamodb-data-types');
var attr = dynamoDdDataTypes.AttributeValue;

var data = {
  foo: ''
};

// By default, empty strings are detected as 'S'
console.log(JSON.stringify(attr.wrap(data), undefined, 2));
// {
//   "foo": { "S": "" }
// }


// You can assign any function to `reconcileFn` to alter the interpretation
// of data types

// Below, we make use of the reconcile function shipped with this library to
// detect empty strings as 'NULL'
var opts = {
  reconcileFn: dynamoDdDataTypes.reconcile
}

console.log(JSON.stringify(attr.wrap(data, opts), undefined, 2));
// {
//   "foo": { "NULL": true }
// }

// TO have a global effect you can do:
// dynamoDdDataTypes.setGlobalOpts(reconcileFn: dynamoDdDataTypes.reconcile)
