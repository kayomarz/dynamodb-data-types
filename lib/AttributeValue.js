var isArray = require('util').isArray;
var errs = require('./errs');

function getType(val) {
  // Assumption: If array, let the first element define the type.
  var item = isArray(val) ? val[0] : val;
  var type = typeof item;

  if (type === 'string')
    return isArray(val) ? 'SS' : 'S';

  if (type === 'number')
    return isArray(val) ? 'NS' : 'N';

  if (type === 'boolean')
    return 'BOOL';

  if (val === null)
    return 'NULL';

  if (type === 'object') {
    // Handle instanceof String, Number.
    // instanceof Number: return N/NS because toString() gets called.
    // instanceof String: need explicit toString(); hence return something
    // other than S or SS.
    if (item instanceof Number)
      return isArray(val) ? 'NS' : 'N';
    if (item instanceof String)
      return isArray(val) ? '_StringS' : '_String';

    return 'M';
  }
}

var unwrapFns = {
  'B': undefined,
  'BS': undefined,
  'N': function (o) {return Number(o);},
  'NS':function (arr) {return arr.map(function(o) {return Number(o);});},
  'S': undefined,
  'SS': undefined,
  'M': function (val) { return unwrap(val); },
  'BOOL': undefined,
  'NULL': function() { return null; }
};

/**
 * Wrap a single value into DynamoDB's AttributeValue.
 * @param {String|Number|Array}  val The value to wrap.
 * @return {Object} DynamoDB AttributeValue.
 */
function wrap1(val) {
  // Note: _String and _StringS are not DynamoDb types. They indicate String 
  // objects for which toString needs to be called.
  switch(getType(val)) {
  case 'S': return {'S': val};
  case 'SS': return {'SS': val};
  case '_String': return {'S': val.toString()};
  case '_StringS': return {'SS': val.map(function(v) { return v.toString(); })};
  case 'N': return {'N': val.toString()};
  case 'NS': return {'NS': val.map(function(v) { return v.toString(); })};
  case 'B': return {'B': val};
  case 'BS': return {'BS': val};
  case 'M': return {'M': wrap(val)};
  case 'NULL': return {'NULL': true};
  case 'BOOL': return {'BOOL': val ? true: false};
  default: return;
  }
}

/**
 *  Wrap object properties into DynamoDB's AttributeValue data type.
 *  @param {Object} obj The object to wrap.
 *  @return {Object} A DynamoDb AttributeValue.
 */
function wrap(obj) {
  var result = {};
  for (var key in obj) {
    if(obj.hasOwnProperty(key)) {
      var wrapped = wrap1(obj[key]);
      if (typeof wrapped !== 'undefined')
	result[key] = wrapped;
    }
  }
  return result;
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

module.exports = {
  wrap: wrap,
  unwrap: unwrap,
  wrap1: wrap1,
  unwrap1: unwrap1
};
