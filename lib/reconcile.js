/* This function can be assigned via the option `reconcileFn`
 * to give the application an opportunity to reconcile data so that it is as
 * per DynamoDB expectations.
 */
function reconcile(val, opts, key, type) {
  switch(type) {
  case 'S': // in Dynamo strings cannot be empty
    return (val.length > 0) ? val : null;
  default: return val;
  }
}

module.exports = reconcile;
