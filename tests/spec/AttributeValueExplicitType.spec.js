var attr = require('../..').AttributeValue;
var attrUpdate = require('../..').AttributeValueUpdate;
var errs = require('../..').errs;
var _ = require('lodash');

var util = require('./util');

var d1 = {
  alphabets: ['c', 'a', 'b'],
  learn: { 
    alphabets: ['y', 'z', 'x'] 
  }
};

var d1_wrap = {"alphabets":{"SS":["c","a","b"]},"learn":{"M":{"alphabets":{"SS":["y","z","x"]}}}};
var d1_wrap_explicit = {"alphabets":{"L":[{"S":"c"},{"S":"a"},{"S":"b"}]},"learn":{"M":{"alphabets":{"L":[{"S":"y"},{"S":"z"},{"S":"x"}]}}}};

var d1_put = {"alphabets":{"Action":"PUT","Value":{"SS":["c","a","b"]}},"learn":{"Action":"PUT","Value":{"M":{"alphabets":{"SS":["y","z","x"]}}}}};

var d1_add = {"alphabets":{"Action":"ADD","Value":{"SS":["c","a","b"]}},"learn":{"Action":"ADD","Value":{"M":{"alphabets":{"SS":["y","z","x"]}}}}};

var d1_put_explicit = {"alphabets":{"Action":"PUT","Value":{"L":[{"S":"c"},{"S":"a"},{"S":"b"}]}},"learn":{"Action":"PUT","Value":{"M":{"alphabets":{"L":[{"S":"y"},{"S":"z"},{"S":"x"}]}}}}};

var d1_add_explicit = {"alphabets":{"Action":"ADD","Value":{"L":[{"S":"c"},{"S":"a"},{"S":"b"}]}},"learn":{"Action":"ADD","Value":{"M":{"alphabets":{"L":[{"S":"y"},{"S":"z"},{"S":"x"}]}}}}};


var opts = {
  types: {alphabets: 'L'}
};

describe('Wrap with explicit types in options', function() {
  it('wrap', function() {
    expect(_.isEqual(attr.wrap(d1), d1_wrap)).toBe(true);
    expect(_.isEqual(attr.wrap(d1, opts), d1_wrap_explicit)).toBe(true);
  });
});

describe('Update with explicit types in options', function() {
  it ('put', function(){
    expect(util.areEqual(attrUpdate.put(d1), d1_put)).toBe(true);
    expect(util.areEqual(attrUpdate.put(d1, opts), d1_put_explicit)).toBe(true);
  });

  it ('add', function(){
    expect(util.areEqual(attrUpdate.add(d1), d1_add)).toBe(true);
    expect(util.areEqual(attrUpdate.add(d1, opts), d1_add_explicit)).toBe(true);
  });
});

// TODO: How can we test preserveArrays() ? Once this function is called, other
// tests would fail.
