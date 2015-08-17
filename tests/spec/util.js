var attrUpdate = require('../..').AttributeValueUpdate;
var _ = require('lodash');

function areEqual(a, b) {
  /* Comparing an `Object' type with an `Updates' type (AttributeValueUpdate)
   * leads to incorrect results */
  if (attrUpdate.isTypeUpdates(a))
    a = _.merge({}, a);
  if (attrUpdate.isTypeUpdates(b))
    b = _.merge({}, a);
  return _.isEqual(a, b);
}


module.exports = {
  areEqual: areEqual
};
