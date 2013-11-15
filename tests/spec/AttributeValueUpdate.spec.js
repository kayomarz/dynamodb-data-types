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

  it("Delete", function() {

    var updateObj5_ = attrUpdate
          .put({name: "some name", age: 18})
          .add({weight: -5})
          .add({age: 1})
          .add({credit: 100.5, bill: 5})
          .delete("hobbies, profession, languages")
          .delete(["work-experience",  "salaray", "history"]);

    expect(areEqual(attrUpdate.delete(mock.obj3), mock.obj3_)).toBe(true);
    expect(areEqual(attrUpdate.delete(mock.obj4), mock.obj4_)).toBe(true);
    expect(areEqual(updateObj5_, mock.obj5_)).toBe(true);
  });

  it("More than one action on the same attribute", function() {
    var overwrite = attrUpdate
          .add({colors: ["orange"]})
          .delete({colors: ["red"]});
    // action to add "orange" gets overwritten by action to delete "red"
    var overwrite_ = {colors:{Action:"DELETE",Value:{"SS":["red"]}}};
    expect(areEqual(overwrite, overwrite_)).toBe(true);
  });

});
