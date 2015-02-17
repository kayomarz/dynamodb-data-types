/*
 * Requirements: These tests require use of a AWS DynamoDB table as mentioned
 * below. 
 * 
 * Dependencies: see packages.json
 *
 * Note: `accessKeyId' and `secretAccessKey' are read from environment
 * variables `AWS_SECRET_ACCESS_KEY' and `AWS_ACCESS_KEY_ID'.
 * 
 */

// Key name => id.  Key Type => Number
var TABLE_NAME = "TestTableForDynamoDbDataTypes";

var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
var dynamo = new AWS.DynamoDB({apiVersion: '2013-10-16'});
var dbopts = {TableName: TABLE_NAME};

var _ = require('lodash');
var async = require('async');
var attr = require('../../').AttributeValue;
var attrUpdate = require('../../').AttributeValueUpdate;

function mkOpts(opts) {
  return _.merge({}, dbopts, opts);
}

var obj1 = {
  id: 1,
  name: "name1",
  age: 20,
  del1: "5Ft 8Inches",
  del2: 1234,
  del3: "trash this",
  del4: 0.001,
  del5: "delete this too",
  nothing: null,
  deep: {
    val: 1.0,
    msg: 'This is level 1',
    nxt: {
      val: 2.0,
      msg: 'This is level 2',
      nxt: {
        val: 3,
        msg: 'This is level 3'
      }
    }
  },
  mix : [0.1, 1, 'foo', null, true, false]
};

var obj1_ = {
  id: 1,
  name: "name2",
  age: 21,
  nothing: null,
  deep: {
    val: 1.0,
    msg: 'This is level 1',
    nxt: {
      val: 2.0,
      msg: 'This is level 2',
      nxt: {
        val: 3,
        msg: 'This is level 3'
      }
    }
  },
  mix : [0.1, 1, 'foo', null, true, false]

};


function createItem(done) {
  var opts = mkOpts({ Item: attr.wrap(obj1) });
  async.waterfall([

    // Create the Item
    function(nextStep) {
      dynamo.putItem(opts, function(err) {
        if(err)
          nextStep("Could not create test item in DB." + err);
        else
          nextStep(null);
      });
    },

    // Read back the Item
    function(nextStep) {
      readItem(nextStep);
    }
  ], function(err, item){
    if (err)
      throw new Error(err.toString());
    else
      done(item);
  });

}

function mkUpdateOpts(updates) {
  return mkOpts({
    Key: attr.wrap({id: 1}),
    AttributeUpdates:  updates
  });
}

function updateItem(done) {
  async.waterfall([
    // update the age
    function(nextStep){
      var opts = mkUpdateOpts(attrUpdate.add({age: 1}));
      dynamo.updateItem(opts, function(err, data) {
        if (err)
          nextStep("Could not update age");
        else
          nextStep(null);
      });
    },

    // Replace the name
    function(nextStep){
      var opts = mkUpdateOpts(attrUpdate.put({name: "name2"}));
      dynamo.updateItem(opts, function(err, data) {
        if (err)
          nextStep("Could not put name.");
        else
          nextStep(null);
      });
    },

    // Delete some items by undefined value for key
    function(nextStep){
      var opts = mkUpdateOpts(attrUpdate.delete("del1"));
      dynamo.updateItem(opts, function(err, data) {
        if (err)
          nextStep("Could not delete del1");
        else
          nextStep(null);
      });
    },

    // Delete some items by csv
    function(nextStep){
      var opts = mkUpdateOpts(attrUpdate.delete("del2, del3 "));
      dynamo.updateItem(opts, function(err, data) {
        if (err)
          nextStep("Could not delete del2, del3");
        else
          nextStep(null);
      });
    },

    // Delete some items by array
    function(nextStep){
      var opts = mkUpdateOpts(attrUpdate.delete(["del4", "del5  "]));
      dynamo.updateItem(opts, function(err, data) {
        if (err)
          nextStep("Could not delete del4, del5");
        else
          nextStep(null);
      });
    },

    // Read back the Item
    function(nextStep) {
      readItem(nextStep);
    }
  ], function(err, item){
    if (err)
      throw new Error(err.toString());
    else
      done(item);
  });
}

function readItem(callback) {
  dynamo.getItem(mkOpts({Key: attr.wrap({id: 1})}), function(err, data) {
    if (err)
      callback("Could not read test item from DB." + err);
    else {
      if (data.Item)
        callback(null, attr.unwrap(data.Item));
      else
        callback("No Item data after reading test item from DB.");
    }
  });
}

module.exports = {
  createItem: createItem,
  updateItem: updateItem,
  obj1: obj1,
  obj1_: obj1_
};
