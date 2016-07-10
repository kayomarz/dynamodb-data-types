var util = require('../..').AttributeValue;
var errs = require('../..').errs;
var mock = require('./AttributeValue.mockdata');
var _ = require('lodash');

describe("AttributeValue", function() {
  var obj1 = mock.obj1;
  var obj1_ = mock.obj1_;
  var obj2 = mock.obj2;
  var obj2_ = mock.obj2_;
  var obj3 = mock.obj3;
  var obj3_ = mock.obj3_;
  var objInvalid_ = mock.objInvalid_;
  var singles = mock.singles;
  var singles_ = mock.singles_;

  // for (var i = 0; i < singles.length; i++)
  //   console.log(util.wrap1(singles[i]));

  // for (var i = 0; i < singles_.length; i++)
  //   console.log(util.unwrap1(singles_[i]));

  function bufferEqual(a, b){
    return a.toString() === b.toString();
  }
  
  it("Sanity check - ensure mock objects are ok", function() {
    expect(_.isEqual(obj1, {})).toBe(false);
    expect(obj1).not.toBe(undefined);
  });

  it("Wrap", function() {
    expect(_.isEqual(util.wrap(obj1), obj1_)).toBe(true);
    var binWrap = util.wrap(obj3).bin.B;
    expect(bufferEqual(binWrap, obj3_.bin.B)).toBe(true);
  });
  it("Wrap singles", function() {
    for (var i = 0; i < singles.length; i++)
      expect(_.isEqual(util.wrap1(singles[i]), singles_[i])).toBe(true);
  });

  it("Wrap String object", function() {
    // Wrapping a String object should result in a native string and not object
    var strs = { s1: new String('abc'), s2: 'def' };
    var actual = util.wrap(strs);
    var expected = { s1: { S: 'abc' },
                     s2: { S: 'def' } };
    // var unexpected = { s1: { S: { '0': 'a', '1': 'b', '2': 'c' } },
    //                    s2: { S: 'def' } }

    expect(actual.s1.S === expected.s1.S).toBe(true);
    expect(actual.s2.S === expected.s2.S).toBe(true);
  });

  it("Unwrap", function() {
    expect(_.isEqual(util.unwrap(obj2_), obj2)).toBe(true);

    var binUnwrap = util.unwrap(obj3_).bin;
    expect(bufferEqual(binUnwrap, obj3.bin)).toBe(true);
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
