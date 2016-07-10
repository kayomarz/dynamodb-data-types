(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* For browserify to create a build for the browser */
window.DynamoDbDataTypes = require('./lib/dynamodb-data-types');

},{"./lib/dynamodb-data-types":4}],2:[function(require,module,exports){
(function (Buffer){
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

}).call(this,require("buffer").Buffer)
},{"./errs":5,"./util":6,"buffer":7}],3:[function(require,module,exports){
var isArray = require('./util').isArray;
var errs = require('./errs');
var attr = require('./AttributeValue');
var util = require('./util');

function isStr(val) {
  return typeof val === "string" || val instanceof String;
}

function hasKeysOnly(attrs) {
  return (attrs && (isStr(attrs) || isArray(attrs))) ? true : false;
}

function appendAttr(action, key, value, updates, opts) {
  if (value !== null && typeof value !== 'undefined')
    updates[key] = {Action: action, Value: attr.wrap1(value, opts, key)};
  else 
    updates[key] = {Action: action};
}

/*  Append attributes without a value.
 *  @param {String} action 
 *  @param {String|Array} attrs key names sepcified as comma separated string or
 *  as an array of strings.
 *  @param {Updates} updates object.
 */
function appendAttrsKeysOnly(action, attrs, updates, opts) {
  if (typeof attrs === "string" || attrs instanceof String)
    attrs = attrs.split(",");
  
  if (attrs && isArray(attrs)) {
    for(var i = 0; i < attrs.length; i++) {
      var key = attrs[i];
      if (key && isStr(key)  && key.length > 0)
        appendAttr(action, key.trim(), null, updates, opts);
    }
  }
  return updates;
}

/* 
 *  Append action and attributes to the specified updates object. 
 */
function appendAttrs(action, attrs, _updates, opts) {
  var updates = isTypeUpdates(this) ? this : (_updates || (new Updates()));

  if (attrs && hasKeysOnly(attrs)) {
    appendAttrsKeysOnly(action, attrs, updates, opts);
  } else if (typeof attrs === "object") {
    util.forIn(attrs, function(value, key) {
      if (value !== null && typeof value !== 'undefined')
        appendAttr(action, key, value, updates, opts);
    });
  }
  
  return updates;
}

/** 
 *  Append attributes to be updated with action "ADD".
 *  This function can be chained with further calls to `add', `put' or `delete'.
 *  @param {Object} attrs Object with attributes to be updated.
 *  @return {Updates} Object with all update attributes in the chain.
 */
function add(attrs, opts) {
  return appendAttrs.call(this, "ADD", attrs, undefined, opts);
}

/** 
 *  Append attributes to be updated with action "PUT".
 *  This function can be chained with further calls to `add', `put' or `delete'.
 *  @param {Object} attrs Object with attributes to be updated.
 *  @return {Updates} Object with all update attributes in the chain.
 */
function put(attrs, opts) {
  return appendAttrs.call(this, "PUT", attrs, undefined, opts);
}

/** 
 *  Append attributes to be updated with action "DELETE".
 *  This function can be chained with further calls to `add', `put' or `delete'.
 *  @param {Object|String|Array} attrs If this argument is an an Object,
 *  the Object's property values must be an array, containing elements to be
 *  removed, as required by DynamoDb SDK. 
 *  If this argument is a String, it should contain comma seperated names of
 *  properties to be deleted.  If its an Array, each array element should be a
 *  property  name to be deleted.
 *  @return {Updates} Object with all update attributes in the chain.
 */
function del(attrs) {
  return appendAttrs.call(this, "DELETE", attrs);
}

module.exports = {
  add: add,
  put: put,
  delete: del, // use del instead of delete as its a reserved keyword.
  isTypeUpdates: isTypeUpdates,
  Updates: Updates
};

function Updates() {
}

function isTypeUpdates(obj) {
  return obj instanceof Updates;
}

function addProp(name, value, target) {
  Object.defineProperty(target, name, {
    value: value,
    writable: false,
    enumerable: false,
    configurable: false
  });
}

addProp("add", add, Updates.prototype);
addProp("put", put, Updates.prototype);
addProp("delete", del, Updates.prototype);

},{"./AttributeValue":2,"./errs":5,"./util":6}],4:[function(require,module,exports){
var attr = require('./AttributeValue');

function preserveArrays() {
  attr._preserveArrays();
}

module.exports = {
    errs:  require('./errs'),
    AttributeValue: attr,
    AttributeValueUpdate: require('./AttributeValueUpdate'),
    preserveArrays: preserveArrays
};

},{"./AttributeValue":2,"./AttributeValueUpdate":3,"./errs":5}],5:[function(require,module,exports){
module.exports = {
    NoDatatype: new Error("No data type (B, BS, N, NS, S, SS)."),
    NoData: new Error("No data")
};

},{}],6:[function(require,module,exports){
/*
 * For each non-inherited, enumarable property, the callback is invoked with
 * arguments: (value, key, object).
 * @param {Object} The object.
 * @param {Function} The function called for each iteration with
 * arguments(value, key, object)
 */
function forIn(obj, fn) {
    var keys = Object.keys(obj);
    var len = keys.length;
    for(var i = 0; i < len; i++) {
      var key = keys[i];
      fn(obj[key], key, obj);
    }
}


var isArray = Array.isArray || function(arg) {
  return Object.prototype.toString.call(arg) === '[object Array]';
};


module.exports = {
  forIn: forIn,
  isArray: isArray
};

},{}],7:[function(require,module,exports){

},{}]},{},[1]);
