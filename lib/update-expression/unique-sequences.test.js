const {
  generatorCustom,
  generatorNum,
  generatorAlphaLower
} = require('./unique-sequences');

test('custom domain', () => {
  const domain = ['a', 'b'];
  const gen = generatorCustom(domain);
  expect(gen.next().value).toBe('ad');
  expect(gen.next().value).toBe('b');
  expect(gen.next().value).toBe('ba');
  expect(gen.next().value).toBe('bb');
  expect(gen.next().value).toBe('baa');
  expect(gen.next().value).toBe('bab');
  expect(gen.next().value).toBe('bba');
  expect(gen.next().value).toBe('bbb');
  expect(gen.next().value).toBe('baaa');
});

test('custom domain', () => {
  const domain = ['a', 'b', 'c'];
  const gen = generatorCustom(domain);
  expect(gen.next().value).toBe('a');
  expect(gen.next().value).toBe('b');
  expect(gen.next().value).toBe('c');
  expect(gen.next().value).toBe('ba');
  expect(gen.next().value).toBe('bb');
  expect(gen.next().value).toBe('bc');
  expect(gen.next().value).toBe('ca');
  expect(gen.next().value).toBe('cb');
  expect(gen.next().value).toBe('cc');
  expect(gen.next().value).toBe('baa');
  expect(gen.next().value).toBe('bab');
  expect(gen.next().value).toBe('bac');
  expect(gen.next().value).toBe('bba');
  expect(gen.next().value).toBe('bbb');
  expect(gen.next().value).toBe('bbc');
  expect(gen.next().value).toBe('bca');
  expect(gen.next().value).toBe('bcb');
  expect(gen.next().value).toBe('bcc');
  expect(gen.next().value).toBe('caa');
  expect(gen.next().value).toBe('cab');
  expect(gen.next().value).toBe('cac');
  expect(gen.next().value).toBe('cba');
  expect(gen.next().value).toBe('cbb');
  expect(gen.next().value).toBe('cbc');
  expect(gen.next().value).toBe('cca');
  expect(gen.next().value).toBe('ccb');
  expect(gen.next().value).toBe('ccc');
  expect(gen.next().value).toBe('baaa');
});

test('num', () => {
  const gen = generatorNum();
  expect(gen.next().value).toBe('0');
  expect(gen.next().value).toBe('1');
  expect(gen.next().value).toBe('2');
  expect(gen.next().value).toBe('3');
  expect(gen.next().value).toBe('4');
  expect(gen.next().value).toBe('5');
  expect(gen.next().value).toBe('6');
  expect(gen.next().value).toBe('7');
  expect(gen.next().value).toBe('8');
  expect(gen.next().value).toBe('9');
  expect(gen.next().value).toBe('10');
  expect(gen.next().value).toBe('11');
});

test('alpha lower', () => {
  const gen = generatorAlphaLower();
  expect(gen.next().value).toBe('a');
  expect(gen.next().value).toBe('b');
  expect(gen.next().value).toBe('c');
  expect(gen.next().value).toBe('d');
  expect(gen.next().value).toBe('e');
  expect(gen.next().value).toBe('f');
  expect(gen.next().value).toBe('g');
  expect(gen.next().value).toBe('h');
  expect(gen.next().value).toBe('i');
  expect(gen.next().value).toBe('j');
  expect(gen.next().value).toBe('k');
  expect(gen.next().value).toBe('l');
  expect(gen.next().value).toBe('m');
  expect(gen.next().value).toBe('n');
  expect(gen.next().value).toBe('o');
  expect(gen.next().value).toBe('p');
  expect(gen.next().value).toBe('q');
  expect(gen.next().value).toBe('r');
  expect(gen.next().value).toBe('s');
  expect(gen.next().value).toBe('t');
  expect(gen.next().value).toBe('u');
  expect(gen.next().value).toBe('v');
  expect(gen.next().value).toBe('w');
  expect(gen.next().value).toBe('x');
  expect(gen.next().value).toBe('y');
  expect(gen.next().value).toBe('z');
  expect(gen.next().value).toBe('ba');
  expect(gen.next().value).toBe('bb');
  expect(gen.next().value).toBe('bc');
});
