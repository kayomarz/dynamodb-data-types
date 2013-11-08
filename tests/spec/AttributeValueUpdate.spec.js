var attrUpdate = require('../..').AttributeValueUpdate;
var errs = require('../..').errs;
var mock = require('./AttributeValueUpdate.mockdata.js');
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

describe("AttributeValueUpdate", function() {

  it("Add", function() {
    expect(areEqual(attrUpdate.add(mock.obj1), mock.obj1_)).toBe(true);
  });

  it("Put", function() {
    expect(areEqual(attrUpdate.put(mock.obj2), mock.obj2_)).toBe(true);
  });

});
