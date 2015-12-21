var isArray = require('./util').isArray;
var errs = require('./errs');

// var DEBUG = false;

var __preserveArrays = false;

function _preserveArrays() {
  __preserveArrays = true;
}

function test(arr, fn) {
  for (var i = 0; i < arr.length; i++) {
    if (!fn(arr[i]))
      return false;
  }
  return true;
}

function isnumber(el) {
  return typeof el === 'number' || el instanceof Number;
}

function isstring(el) {
  return typeof el === 'string' || el instanceof String;
}

function isbinary(el) {
  if (el instanceof Buffer)
    return true;
  return false;
}

function detectType(val) {
  if (isArray(val)) {
    var arr = val;
    if (test(arr, isnumber))
      return 'NS';

    if (test(arr, isstring))
      return 'SS';

    if (test(arr, isbinary))
      return 'BS';

    return 'L';
  }

  if (isstring(val))
    return 'S';

  if (isnumber(val))
    return 'N';

  if (isbinary(val))
    return 'B';

  if (val === null)
    return 'NULL';
  
  if (typeof val === 'boolean')
    return 'BOOL';

  if (typeof val === 'object') {
    return 'M';
  }
}

function explicit_type(opts, key) {

  var type_specified = typeof opts === 'object' &&
        typeof opts.types === 'object' &&
        typeof key === 'string' &&
        typeof opts.types[key] === 'string';

  if (!type_specified)
    return;

  var type = opts.types[key];
  if (typeExists(type))
    return type;
}


var MULTIPLES = ['L', 'BS', 'NS', 'SS'];
function getType(val, opts, key) {
  var explicit = explicit_type(opts, key);
  var detected = detectType(val);

  var type = detected;
  if (isArray(val) && __preserveArrays)
    type = 'L';
  if (MULTIPLES.indexOf(explicit) > -1 && MULTIPLES.indexOf(detected) > -1)
    type = explicit;

  return type;
}

function eachToString(arr) {
  return arr.map(function(v) { 
    return v.toString(); 
  });
}

/**
 * Wrap a single value into DynamoDB's AttributeValue.
 * @param {String|Number|Array}  val The value to wrap.
 * @return {Object} DynamoDB AttributeValue.
 */
function wrap1(val, opts, key) {
  switch(getType(val, opts, key)) {
  case 'B': return {'B': val};
  case 'BS': return {'BS': val};
  case 'N': return {'N': val.toString()};
  case 'NS': return {'NS': eachToString(val)};
  case 'S': return {'S': val.toString()};
  case 'SS': return {'SS': eachToString(val)};
  case 'BOOL': return {'BOOL': val ? true: false};
  case 'L': return {'L': val.map(function(obj){ return wrap1(obj, opts); })};
  case 'M': return {'M': wrap(val, opts)};
  case 'NULL': return {'NULL': true};
  default: return;
  }
}

/**
 *  Wrap object properties into DynamoDB's AttributeValue data type.
 *  @param {Object} obj The object to wrap.
 *  @return {Object} A DynamoDb AttributeValue.
 */
function wrap(obj, opts) {
  var result = {};
  for (var key in obj) {
    if(obj.hasOwnProperty(key)) {
      var wrapped = wrap1(obj[key], opts, key);
      if (typeof wrapped !== 'undefined')
        result[key] = wrapped;
    }
  }
  return result;
}

var unwrapFns = {
  'B': undefined,
  'BS': undefined,
  'N': function (o) { return Number(o); },
  'NS':function (arr) { return arr.map(function(o) {return Number(o);}); },
  'S': undefined,
  'SS': undefined,
  'BOOL': undefined,
  'L': function(val) { return val.map(unwrap1); },
  'M': function (val) { return unwrap(val); },
  'NULL': function() { return null; }
};

function typeExists(type) {
  return unwrapFns.hasOwnProperty(type);
}

/**
 * Unwrap a single DynamoDB's AttributeValue to a value of the appropriate
 * javascript type. 
 * @param {Object} attributeValue The DynamoDB AttributeValue.
 * @return {String|Number|Array}  The javascript value.
 */
function unwrap1(dynamoData) {
  var keys = Object.keys(dynamoData);
  if (keys.length !== 1)
    throw new Error('Unexpected DynamoDB AttributeValue');
  var typeStr = keys[0];
  if (!unwrapFns.hasOwnProperty(typeStr))
    throw errs.NoDatatype;
  var val = dynamoData[typeStr];
  return unwrapFns[typeStr] ? unwrapFns[typeStr](val) : val;
}

/**
 *  Unwrap DynamoDB AttributeValues to values of the appropriate types.
 *  @param {Object} attributeValue The DynamoDb AttributeValue to unwrap.
 *  @return {Object} Unwrapped object with properties.
 */
function unwrap(attrVal) {
  var result = {};
  for (var key in attrVal) {
    if(attrVal.hasOwnProperty(key)) {
      var value = attrVal[key];
      if (value !== null && typeof value !== 'undefined') 
        result[key] = unwrap1(attrVal[key]);
    }
  }
  return result;
}

// function printData(input, result, title) {
//   if (DEBUG) {
//     console.log(title + ' input:');
//     console.log(JSON.stringify(input, undefined, 2));
//     console.log(title + ' result:');
//     console.log(JSON.stringify(result, undefined, 2));
//   }
//   return result;
// }

function wrapDebug(obj, opts) {
  var wrapped = wrap(obj, opts);
  // if (DEBUG)
  //   printData(obj, wrapped, 'wrap');
  return wrapped;
}

function unwrapDebug(attrVal) {
  var unwrapped = unwrap(attrVal);
  // if (DEBUG)
  //   printData(attrVal, unwrapped, 'unwrap');
  return unwrapped;
}

module.exports = {
  wrap: wrapDebug,
  unwrap: unwrapDebug,
  wrap1: wrap1,
  unwrap1: unwrap1,
  _preserveArrays: _preserveArrays
};
