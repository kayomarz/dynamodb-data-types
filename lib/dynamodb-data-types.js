var attr = require('./AttributeValue');
var opts = require('./opts');

function preserveArrays() {
  attr._preserveArrays();
}

function setGlobalOpts() {
  opts.setGlobalOpts.apply(undefined, arguments);
}

module.exports = {
  errs:  require('./errs'),
  AttributeValue: attr,
  AttributeValueUpdate: require('./AttributeValueUpdate'),
  preserveArrays: preserveArrays,
  setGlobalOpts: setGlobalOpts,
  reconcile: require('./reconcile')
};
