var attrUpdate = require('../..').AttributeValueUpdate;
var errs = require('../..').errs;
var mock = require('./AttributeValueUpdate.mockdata.js');
var _ = require('lodash');

describe("AttributeValueUpdate", function() {

  it("Add", function() {
    expect(_.isEqual(attrUpdate.add(mock.obj1), mock.obj1_)).toBe(true);
  });

  it("Put", function() {
    expect(_.isEqual(attrUpdate.put(mock.obj2), mock.obj2_)).toBe(true);
  });

});
