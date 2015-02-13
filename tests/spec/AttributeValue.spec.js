var util = require('../..').AttributeValue;
var errs = require('../..').errs;
var mock = require('./AttributeValue.mockdata');
var _ = require('lodash');

describe("AttributeValue", function() {
  var obj1 = mock.obj1;
  var obj1_ = mock.obj1_;
  var obj2 = mock.obj2;
  var obj2_ = mock.obj2_;
  var objInvalid_ = mock.objInvalid_;
  var singles = mock.singles;
  var singles_ = mock.singles_;

  // for (var i = 0; i < singles.length; i++)
  //   console.log(util.wrap1(singles[i]));

  // for (var i = 0; i < singles_.length; i++)
  //   console.log(util.unwrap1(singles_[i]));

  it("Sanity check - ensure mock objects are ok", function() {
    expect(_.isEqual(obj1, {})).toBe(false);
    expect(obj1).not.toBe(undefined);
  });

  it("Wrap", function() {
    expect(_.isEqual(util.wrap(obj1), obj1_)).toBe(true);
  });

  it("Wrap singles", function() {
    for (var i = 0; i < singles.length; i++)
      expect(_.isEqual(util.wrap1(singles[i]), singles_[i])).toBe(true);
  });

  it("Unwrap", function() {
    expect(_.isEqual(util.unwrap(obj2_), obj2)).toBe(true);
  });

  it("Unwrap singles", function() {
    for (var i = 0; i < singles_.length; i++)
      expect(_.isEqual(util.unwrap1(singles_[i]), singles[i])).toBe(true);
  });
  it("No DynamoDb data type", function() {
    expect(function(){util.unwrap(objInvalid_);}).toThrow(errs.NoDatatype);
  });

  // it("No data", function() {
  //   expect(function(){util.wrap({});}).toThrow(errs.NoData);
  //   expect(function(){util.unwrap({});}).toThrow(errs.NoData);
  // });
});
