var isArray = require('util').isArray;
var errs = require('./errs');
var attr = require('./AttributeValue');
var util = require('./util');

function _attr(value, key, action, updates) {
  switch(action) {
  case 'ADD': 
    if (value !== null && typeof value !== 'undefined') 
      updates[key] = {Action: action, Value: attr.wrap1(value)};
    break;

  case 'PUT': 
    if (value !== null && typeof value !== 'undefined') 
      updates[key] = {Action: action, Value: attr.wrap1(value)};
    break;
    
  case 'DELETE':
    if (value !== null && typeof value !== 'undefined') 
      updates[key] = {Action: action, Value: attr.wrap1(value)};
    else
      updates[key] = {Action: action};
    break;
  }
}

function _update(action, item) {
  if (!item)
    return {};
  var updates = {};
  util.forIn(item, function(value, key) {
    _attr(value, key, action, updates);
  });
  return updates;
}

function add(item) {
  return _update('ADD', item);
}

function put(item) {
  return _update('PUT', item);
}


function delete_(item) {
  if (!item)
    return {};
  if ((typeof item === "string") || isArray(item))
    return _deleteKeys(item);
  else
    return _update('DELETE', item);
}

function _deleteKeys(keys) {
  var updates;

  if (typeof keys === "string") {
    keys = keys.trim();
    if (keys.length === 0)
      return {};
    keys = keys.split(",");
  }

  if (isArray(keys)) {
    updates = {};
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i].trim();
      if (key.length > 0)
        _attr(null, key, "DELETE", updates);      
    }
    return updates;
  }
}

module.exports = {
  add: add,
  put: put,
  delete: delete_
};
