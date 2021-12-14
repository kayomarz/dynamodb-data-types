const ALPHA_LOWER = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
];

const ALPHA_UPPER = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
];

const NUM = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const ALPHA = [...ALPHA_UPPER, ...ALPHA_LOWER];
const ALPHA_NUM = [...ALPHA, ...NUM];

function generator(domain) {
  const MIN_LEN = 2;
  const len = domain.length;
  if (len < MIN_LEN) {
    throw new Error(`mininum domain length is ${MIN_LEN}, got ${len}.`);
  }
  let count = 0;
  return function* gen() {
    while (true) {
      const strIndices = [...count.toString(len)];
      const indices = strIndices.map(num => parseInt(num, len));
      const val = indices.map(i => domain[i]).join('');
      yield val;
      count++;
    }
  };
}

function generatorCustom(domain) { return generator(domain)(); }
function generatorNum() { return generator(NUM)(); }
function generatorAlphaLower() { return generator(ALPHA_LOWER)(); }
function generatorAlphaUpper() { return generator(ALPHA_UPPER)(); }

module.exports.generatorCustom = generatorCustom;
module.exports.generatorNum = generatorNum;
module.exports.generatorAlphaLower = generatorAlphaLower;
module.exports.generatorAlphaUpper = generatorAlphaUpper;
