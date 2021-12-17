const { generatorAlphaLower, generatorAlphaUpper } = require(
  'unique-sequences'
);

const attr = require('../AttributeValue');

function valueRefs() {
  const list = [];
  const generator = generatorAlphaLower();
  const existing = {};

  function isPrimitive(val) {
    const t = typeof val;
    return val === null ||
      t === 'string' ||
      t === 'number' ||
      t === 'boolean';
  }

  function isExistingValue(item) {
    return isPrimitive(item) &&
      typeof existing[item] !== 'undefined';
  }

  function addToExistingValues(item, ref) {
    existing[item] = ref;
  }

  function getExistingValue(item) {
    return existing[item];
  }

  return {
    get items() { return list; },
    get length() { return list.length; },
    makeRef(item) {
      if (isExistingValue(item)) {
        return getExistingValue(item);
      }
      const ref = `:${generator.next().value}`;
      list.push([ref, attr.wrap1(item)]);
      addToExistingValues(item, ref);
      return ref;
    },
  };
}

function nameRefs() {
  const list = [];
  const generator = generatorAlphaUpper();

  return {
    get items() { return list; },
    get length() { return list.length; },
    makeRef(item) {
      const ref = `#${generator.next().value}`;
      list.push([ref, item]);
      return ref;
    },
  };
}

function refsForUpdateExpr() {
  return {
    valueRefs: valueRefs(),
    nameRefs: nameRefs()
  };
}

module.exports.refsForUpdateExpr = refsForUpdateExpr;
