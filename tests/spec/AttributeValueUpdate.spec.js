var attrUpdate = require('../..').AttributeValueUpdate;
var errs = require('../..').errs;
var mock = require('./AttributeValueUpdate.mockdata.js');
var _ = require('lodash');
var util = require('./util');

describe("AttributeValueUpdate", function() {

  it("Add", function() {
    expect(util.areEqual(attrUpdate.add(mock.obj1), mock.obj1_)).toBe(true);
  });

  it("Put", function() {
    expect(util.areEqual(attrUpdate.put(mock.obj2), mock.obj2_)).toBe(true);
  });

  it("Delete", function() {

    var updateObj5_ = attrUpdate
          .put({name: "some name", age: 18})
          .add({weight: -5})
          .add({age: 1})
          .add({credit: 100.5, bill: 5})
          .delete("hobbies, profession, languages")
          .delete(["work-experience",  "salaray", "history"]);

    expect(util.areEqual(attrUpdate.delete(mock.obj3), mock.obj3_)).toBe(true);
    expect(util.areEqual(attrUpdate.delete(mock.obj4), mock.obj4_)).toBe(true);
    expect(util.areEqual(updateObj5_, mock.obj5_)).toBe(true);
  });

  it("More than one action on the same attribute", function() {
    var overwrite = attrUpdate
          .add({colors: ["orange"]})
          .delete({colors: ["red"]});
    // action to add "orange" gets overwritten by action to delete "red"
    var overwrite_ = {colors:{Action:"DELETE",Value:{"SS":["red"]}}};
    expect(util.areEqual(overwrite, overwrite_)).toBe(true);
  });

});
