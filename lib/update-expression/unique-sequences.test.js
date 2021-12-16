const {
  generatorCustom,
  generatorNum,
  generatorAlphaUpper,
  generatorAlphaLower,
  generatorAlphaNumUpper,
  generatorAlphaNumLower,
} = require('./unique-sequences');

test('custom domain', () => {
  const domain = ['a', 'b'];
  const gen = generatorCustom(domain);
  expect(gen.next().value).toBe('a');
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

test('alpha upper', () => {
  const gen = generatorAlphaUpper();
  expect(gen.next().value).toBe('A');
  expect(gen.next().value).toBe('B');
  expect(gen.next().value).toBe('C');
  expect(gen.next().value).toBe('D');
  expect(gen.next().value).toBe('E');
  expect(gen.next().value).toBe('F');
  expect(gen.next().value).toBe('G');
  expect(gen.next().value).toBe('H');
  expect(gen.next().value).toBe('I');
  expect(gen.next().value).toBe('J');
  expect(gen.next().value).toBe('K');
  expect(gen.next().value).toBe('L');
  expect(gen.next().value).toBe('M');
  expect(gen.next().value).toBe('N');
  expect(gen.next().value).toBe('O');
  expect(gen.next().value).toBe('P');
  expect(gen.next().value).toBe('Q');
  expect(gen.next().value).toBe('R');
  expect(gen.next().value).toBe('S');
  expect(gen.next().value).toBe('T');
  expect(gen.next().value).toBe('U');
  expect(gen.next().value).toBe('V');
  expect(gen.next().value).toBe('W');
  expect(gen.next().value).toBe('X');
  expect(gen.next().value).toBe('Y');
  expect(gen.next().value).toBe('Z');
  expect(gen.next().value).toBe('BA');
  expect(gen.next().value).toBe('BB');
  expect(gen.next().value).toBe('BC');
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

test('alphanum upper', () => {
  const gen = generatorAlphaNumUpper();
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
  expect(gen.next().value).toBe('A');
  expect(gen.next().value).toBe('B');
  expect(gen.next().value).toBe('C');
  expect(gen.next().value).toBe('D');
  expect(gen.next().value).toBe('E');
  expect(gen.next().value).toBe('F');
  expect(gen.next().value).toBe('G');
  expect(gen.next().value).toBe('H');
  expect(gen.next().value).toBe('I');
  expect(gen.next().value).toBe('J');
  expect(gen.next().value).toBe('K');
  expect(gen.next().value).toBe('L');
  expect(gen.next().value).toBe('M');
  expect(gen.next().value).toBe('N');
  expect(gen.next().value).toBe('O');
  expect(gen.next().value).toBe('P');
  expect(gen.next().value).toBe('Q');
  expect(gen.next().value).toBe('R');
  expect(gen.next().value).toBe('S');
  expect(gen.next().value).toBe('T');
  expect(gen.next().value).toBe('U');
  expect(gen.next().value).toBe('V');
  expect(gen.next().value).toBe('W');
  expect(gen.next().value).toBe('X');
  expect(gen.next().value).toBe('Y');
  expect(gen.next().value).toBe('Z');
  expect(gen.next().value).toBe('10');
  expect(gen.next().value).toBe('11');
  expect(gen.next().value).toBe('12');
  expect(gen.next().value).toBe('13');
  expect(gen.next().value).toBe('14');
  expect(gen.next().value).toBe('15');
  expect(gen.next().value).toBe('16');
  expect(gen.next().value).toBe('17');
  expect(gen.next().value).toBe('18');
  expect(gen.next().value).toBe('19');
  expect(gen.next().value).toBe('1A');
  expect(gen.next().value).toBe('1B');
});

test('alphanum lower', () => {
  const gen = generatorAlphaNumLower();
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
  expect(gen.next().value).toBe('10');
  expect(gen.next().value).toBe('11');
  expect(gen.next().value).toBe('12');
  expect(gen.next().value).toBe('13');
  expect(gen.next().value).toBe('14');
  expect(gen.next().value).toBe('15');
  expect(gen.next().value).toBe('16');
  expect(gen.next().value).toBe('17');
  expect(gen.next().value).toBe('18');
  expect(gen.next().value).toBe('19');
  expect(gen.next().value).toBe('1a');
  expect(gen.next().value).toBe('1b');
});

test('test higher ranges', () => {
  const genN = generatorNum();
  const genAU = generatorAlphaUpper();
  const genAL = generatorAlphaLower();

  for (let i = 0; i < 1000; i++) {
    genN.next().value;  //eslint-disable-line
    genAU.next().value; //eslint-disable-line
    genAL.next().value; //eslint-disable-line
  }
  expect(genN.next().value).toBe('1000');
  expect(genAU.next().value).toBe('BMM');
  expect(genAL.next().value).toBe('bmm');
});
