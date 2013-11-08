var isArray = require('util').isArray;
var errs = require('./errs');
var attr = require('./AttributeValue');
var util = require('./util');

function isStr(val) {
  return typeof val === "string" || val instanceof String;
}

function hasKeysOnly(attrs) {
  return (attrs && (isStr(attrs) || isArray(attrs))) ? true : false;
}

function appendAttr(action, key, value, updates) {
  if (value !== null && typeof value !== 'undefined')
    updates[key] = {Action: action, Value: attr.wrap1(value)};
  else 
    updates[key] = {Action: action};
}

/* If only keys are specified as a comma separated string or as an array
 * of strings. */
function appendAttrsKeysOnly(action, attrs, updates) {
  if (typeof attrs === "string" || attrs instanceof String)
    attrs = attrs.split(",");
  
  if (attrs && isArray(attrs)) {
    for(var i = 0; i < attrs.length; i++) {
      var key = attrs[i];
      if (key && isStr(key)  && key.length > 0)
        appendAttr(action, key.trim(), null, updates);
    }
  }
  return updates;
}

function appendAttrs(action, attrs, _updates) {
  var updates = isTypeUpdates(this) ? this : (_updates || (new Updates()));

  if (attrs && hasKeysOnly(attrs)) {
    appendAttrsKeysOnly(action, attrs, updates);
  } else if (typeof attrs === "object") {
    util.forIn(attrs, function(value, key) {
      if (value !== null && typeof value !== 'undefined')
        appendAttr(action, key, value, updates);
    });
  }
  
  return updates;
}

function add(attrs, updates) {
  return appendAttrs.call(this, "ADD", attrs, updates);
}

function put(attrs, updates) {
  return appendAttrs.call(this, "PUT", attrs, updates);
}

function del(attrs, updates) {
  return appendAttrs.call(this, "DELETE", attrs, updates);
}

module.exports = {
  add: add,
  put: put,
  delete: del, // use del instead of delete as its a reserved keyword.
  isTypeUpdates: isTypeUpdates,
  up: Updates
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
