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

module.exports = {forIn: forIn};
