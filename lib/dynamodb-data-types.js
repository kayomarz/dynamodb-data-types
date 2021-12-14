var attr = require('./AttributeValue');

function preserveArrays() {
  attr._preserveArrays();
}

module.exports = {
  errs: require('./errs'),
  AttributeValue: attr,
  AttributeValueUpdate: require('./AttributeValueUpdate'),
  updateExpr: require('./update-expression').updateExpr,
  preserveArrays: preserveArrays
};
