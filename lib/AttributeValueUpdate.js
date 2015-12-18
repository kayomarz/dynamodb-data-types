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
