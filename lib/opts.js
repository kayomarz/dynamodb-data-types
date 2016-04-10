var util = require('./util');

var defaults = {
  reconcile: undefined
};

var globalOpts = {};
setGlobalOpts(defaults);

function setGlobalOpts() {
  var args = Array.prototype.slice.call(arguments);
  args.unshift(globalOpts);
  util.objectAssign.apply(util, args);
}

function mkOpts() {
  var args = Array.prototype.slice.call(arguments);
  args.unshift(globalOpts);
  args.unshift({});
  return util.objectAssign.apply(util, args);
}

module.exports = {
  globalOpts: globalOpts,
  mkOpts: mkOpts,
  setGlobalOpts:  setGlobalOpts
};
