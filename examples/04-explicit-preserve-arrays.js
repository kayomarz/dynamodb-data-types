/* This example demonstrates use of preserveArrays().
 * Run this example on the command line as follows:
 * $ node 04-explicit-preserve-arrays
 */

var ddt = require('dynamodb-data-types');
ddt.preserveArrays();
var attr = ddt.AttributeValue;
var attrUpdate = ddt.AttributeValueUpdate;

var data = {
  alphabets: ['c', 'a', 'b']
};

// ie. Since preserveArrays() was called, by default, all arrays get type 'L'
console.log("Put data without explicit type:\n", JSON.stringify(attr.wrap(data)));
// Put data without explicit type:
//  {"alphabets":{"L":[{"S":"c"},{"S":"a"},{"S":"b"}]}}
// Note: Without the use of preservArrays(), it would be:

var opts_SS = { types: { alphabets: 'SS' } };
// ie. Override the use of preserveArrays() by passing opts to wrap()
console.log("Put data with explicity type 'SS':\n", JSON.stringify(attr.wrap(data, opts_SS)));
// Put data with explicity type 'SS':
//  {"alphabets":{"SS":["c","a","b"]}}

// Quiz: What would be the result without the call to ddt.preserveArrays()
