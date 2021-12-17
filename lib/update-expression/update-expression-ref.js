const { generatorAlphaLower, generatorAlphaUpper } = require(
  'unique-sequences'
);

const attr = require('../AttributeValue');

function valueRefs() {
  const list = [];
  const generator = generatorAlphaLower();
  const isExisting = {};

  return {
    get items() { return list; },
    get length() { return list.length; },
    makeRef(item) {
      if (typeof isExisting[item] === 'undefined') {
        const ref = `:${generator.next().value}`;
        isExisting[item] = ref;
        list.push([ref, attr.wrap1(item)]);
        return ref;
      }
      return isExisting[item];
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
