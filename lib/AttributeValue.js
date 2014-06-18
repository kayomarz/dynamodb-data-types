// Read notes titled `Assumption'.

var isArray = require('util').isArray;
var errs = require('./errs');

/*  For all properties in an item, call the specified function which will either
 *  wrap or unwrap.
 *  @param {Object} The item with properties.
 *  @return {Function} The function to wrap / unwrap.
 */
function wrap_unwrap_all(item, wrap_unwrap_fn) {
  if (!item)
    return item;
  var result = {};
  var keys = Object.keys(item);
  var len = keys.length;
  if (len === 0)
    throw errs.NoData;
  for(var i = 0; i < len; i++) {
    var key = keys[i];
    var value = item[key];
    if (value !== null && typeof value !== 'undefined') 
      result[key] = wrap_unwrap_fn(value);
  }
  return result;
}

/**
 *  Wrap object properties into DynamoDB's AttributeValue data type.
 *  @param {Object} item The object to wrap.
 *  @return {Object} A DynamoDb AttributeValue.
 */
function wrap(item) {
  return wrap_unwrap_all(item, wrap1);
}

/**
 *  Unwrap DynamoDB AttributeValues to values of the appropriate types.
 *  @param {Object} attributeValue The DynamoDb AttributeValue to unwrap.
 *  @return {Object} Unwrapped object with properties.
 */
function unwrap(attributeValue) {
  return wrap_unwrap_all(attributeValue, unwrap1);
}

/**
 * Wrap a single value into DynamoDB's AttributeValue.
 * @param {String|Number|Array} 
 * @return {Object} DynamoDB AttributeValue.
 */
function wrap1(value) {
  return _wrap1.apply(this, arguments);
}

/**
 * Unwrap a single DynamoDB's AttributeValue to a value of the appropriate
 * javascript type. 
 * @param {Object} attributeValue The DynamoDB AttributeValue.
 * @return {String|Number|Array}  The javascript value.
 */
function unwrap1(attributeValue) {
  return _unwrap1.apply(this, arguments);
}

var _wrap1 = (function wrapping(){

  function mapToString(jsVal) {
    return jsVal.toString();
  }

  var wrapDataTypes = {
    "strNative": function(jsVal) {
      return {"S": jsVal}; // no need to call toString()
    },
    "strObject": function(jsVal) {
      return {"S": jsVal.toString()};
    },
    "num": function(jsVal) {
      return {"N": jsVal.toString()};
    },
    "bin": function(jsVal) {
      return {"B": jsVal};
    }
  };

  var wrapDatasetTypes = {
    "strNative": function(jsVal) {
      return {"SS": jsVal};
    },
    "strObject": function(jsVal) {
      return {"SS": jsVal.map(mapToString)};
    },
    "num": function(jsVal) {
      return {"NS": jsVal.map(mapToString)};
    },
    "bin": function(jsVal) {
      return {"BS": jsVal};
    }
  };

  /* Assumption:
   * When detecting a data type, check if its a string or number, else assume
   * it is a binary type.
   * This library assumes data types being sent to DynamoDb are valid and does
   * not do extensive type checking. */
  function getType(jsVal) {
    if (typeof jsVal === 'string')
      return "strNative";
    else if (jsVal instanceof String)
      return "strObject";
    else if (typeof jsVal === 'number' || jsVal instanceof Number)
      return "num";
    else 
      return  "bin";
  }

  function _wrap(jsVal) {
    return isArray(jsVal) ?
      // Assumption:
      // For data set (array) let first element define the type.
      wrapDatasetTypes[getType(jsVal[0])](jsVal) :
      wrapDataTypes[getType(jsVal)](jsVal);
  }

  return _wrap;
}());

var _unwrap1 = (function unwrapping(){

  var funcs = {
    "B": function(str){
      var buff = new Buffer(str.length);
      for (var i=0; i<str.length; i++) {
        buff[i] === str.charCodeAt(i);
      }
      return buff
    },
    "BS": function(strs){
      return strs.map(funcs.B);
    },
    "N": function (o) {return Number(o);},
    "NS":function (arr) {return arr.map(function(o) {return Number(o);});},
    "S": undefined,
    "SS": undefined
  };

  var types = Object.keys(funcs);
  var typesCSV = types.join(", ");

  function _unwrap(dynamoData) {
    for(var i = 0; i < types.length; i++) {
      var typeStr = types[i];
      var val = dynamoData[typeStr];
      if (val)
        return funcs[typeStr] ? funcs[typeStr](val) : val;
    }
    throw errs.NoDatatype;
  }

  return _unwrap;

}());

module.exports = {
  wrap: wrap,
  unwrap: unwrap,
  wrap1: wrap1,
  unwrap1: unwrap1
};
