var util = require('../..').AttributeValue;
var errs = require('../..').errs;
var _ = require('lodash');

var ddt = require('../..');
ddt.preserveArrays();
var attr = ddt.AttributeValue;
var attrUpdate = ddt.AttributeValueUpdate;

var obj = {
  alphabets: ['c', 'a', 'b', 'c']
};

var obj_ = {
  "alphabets":{ "L": [{ "S": "c" },{ "S": "a" },{ "S": "b" },{ "S": "c" }]}
};

// ps: without preserveArrays, obj_ would be:
// {"alphabets":{"SS":["c","a","b","c"]}}


describe("AttributeValue preserve array", function() {
  it("Wrap", function() {
    expect(_.isEqual(util.wrap(obj), obj_)).toBe(true);
  });

});
