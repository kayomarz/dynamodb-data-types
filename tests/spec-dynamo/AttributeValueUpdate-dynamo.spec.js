var _ = require('lodash');
var db = require('./AttributeValueUpdate-dynamo.js');


// Give a timeout keeping in mind the network delays (DNS lookup, connection,
// everything), also keeping in mind there may be more than 1 Dynamo Db request
// which needs to complete witin this timeout.
var TIMEOUT_MINS = 1;
var TIMEOUT_MS = TIMEOUT_MINS*60*1000;


// This delay is meant to keeps the request rate remains below the provisioned
// throughput. In practise, this delay might not be needed due to the network
// response time.  You can reduce the delay to 0 to speeden things but if the
// number of tests remain few, the delay for these tests won't matter.
// Many of the opreations actually involve 2 DB operations. for example the
// db.createItem uses 1 write and 1 read transactions.  Incase there are any
// throughput exceeding issues look there as well.
var DELAY_FOR_THROUGHPUT = 500;


describe("AttributeValueUpdate", function() {

  it("Test AttributeValueUpdate with DynamoDb", function() {

    var item1;
    var item1_;

    runs(function() {
      db.createItem(function(item){ item1 = item; });
    });

    waitsFor(
      function(){ return (typeof item1 !== "undefined"); }, 
      "Creating Item: Error Occured", 
      TIMEOUT_MS);

    runs(function(){
      console.log(JSON.stringify(item1, undefined, 2));
      expect(_.isEqual(item1, db.obj1)).toBe(true);
    });

    waits(DELAY_FOR_THROUGHPUT);

    runs(function() {
      db.updateItem(function(item){ item1_ = item; });
    });

    waitsFor(
      function(){ return (typeof item1_ !== "undefined"); }, 
      "Updating Item: Error Occured", 
      TIMEOUT_MS);

    runs(function(){
      console.log(JSON.stringify(item1_, undefined, 2));
      expect(_.isEqual(item1_, db.obj1_)).toBe(true);
    });

  });

});
