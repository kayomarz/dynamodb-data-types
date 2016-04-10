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

function assign(target) {
  'use strict';

  // Adapted from polyfill:
  // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
  // License: https://developer.mozilla.org/en-US/docs/MDN/About#Copyrights_and_licenses

  if (target === undefined || target === null) {
    throw new TypeError('Cannot convert undefined or null to object');
  }

  var output = Object(target);
  for (var index = 1; index < arguments.length; index++) {
    var source = arguments[index];
    if (source !== undefined && source !== null) {
      for (var nextKey in source) {
        if (source.hasOwnProperty(nextKey)) {
          output[nextKey] = source[nextKey];
        }
      }
    }
  }
  return output;
};

module.exports = {
  forIn: forIn,
  isArray: isArray,
  objectAssign: (typeof Object.assign != 'function') ? assign : Object.assign
};
