var attr = require('./AttributeValue');

function preserveArrays() {
  attr._preserveArrays();
}

module.exports = {
    errs:  require('./errs'),
    AttributeValue: attr,
    AttributeValueUpdate: require('./AttributeValueUpdate'),
    preserveArrays: preserveArrays
};
