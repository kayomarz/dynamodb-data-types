const { updateExpr } = require('./update-expression');

test('updateExpr add', () => {
  const props = updateExpr()
        .add({
          age: 1,
          numbers: [0, 1, 2, 3],
          nothing1: null,
          nothing2: undefined
        })
        .expr();

  expect(props).toEqual({
    ExpressionAttributeValues: {
      ':a': { N: '1' },
      ':b': { NS: ['0', '1', '2', '3'] },
      ':c': { NULL: true },
    },
    UpdateExpression: 'ADD age :a, numbers :b, nothing1 :c',
  });
});

test('updateExpr set', () => {
  const props = updateExpr()
        .set({
          name: 'new name',
          nickNames: ['nick1', 'nick2'],
          age: 20,
          numbers: [0, 2, 4, 6],
          nothing1: null,
          nothing2: undefined
        })
        .expr();
  expect(props).toEqual({
    ExpressionAttributeValues: {
      ':a': { S: 'new name' },
      ':b': { SS: ['nick1', 'nick2'] },
      ':c': { N: '20' },
      ':d': { NS: ['0', '2', '4', '6'] },
      ':e': { NULL: true }
    },
    ExpressionAttributeNames: {
      '#A': 'name'
    },
    UpdateExpression: 'SET #A = :a, nickNames = :b, age = :c, numbers = :d, nothing1 = :e',
  });
});

test('updateExpr remove', () => {
  const props = updateExpr()
        .remove('name')
        .remove('age')
        .remove('tel')
        .remove('history')
        .expr();
  expect(props).toEqual({
    UpdateExpression: 'REMOVE name, age, tel, history',
  });
});

test('updateExpr delete', () => {
  const props = updateExpr()
        .delete({
          colors: ['red'],
          numbers: [123]
        })
        .delete({
          refs: [456]
        })
        .expr();
  expect(props).toEqual({
    UpdateExpression: 'DELETE colors :a, numbers :b, refs :c',
    ExpressionAttributeValues: {
      ':a': { SS: ['red'] },
      ':b': { NS: ['123'] },
      ':c': { NS: ['456'] }
    }
  });
});

test('updateExpr', () => {
  const props = updateExpr()
        .set({ name: 'some name' })
        .add({ age: 1 })
        .add({ weight: -5 })
        .add({ credit: 100.5, bill: 5 })
        .delete({ roles: ['admin'], day: [3] })
        .remove('hobbies, profession')
        .remove('languages')
        .delete({ refs: [456] })
        .remove('work-experience')
        .expr();

  expect(props).toEqual({
    UpdateExpression: 'SET #A = :a REMOVE hobbies, profession, languages, work-experience ADD age :b, weight :c, credit :d, bill :e DELETE #B :f, #C :g, refs :h',
    ExpressionAttributeValues: {
      ':a': { S: 'some name' },
      ':b': { N: '1' },
      ':c': { N: '-5' },
      ':d': { N: '100.5' },
      ':e': { N: '5' },
      ':f': { SS: ['admin'] },
      ':g': { NS: ['3'] },
      ':h': { NS: ['456'] },
    },
    ExpressionAttributeNames: {
      '#A': 'name',
      '#B': 'roles',
      '#C': 'day',
    }
  });
});

test('updateExpr', () => {
  const expr = updateExpr().set({ name: 1 });
  expect(expr.expr()).toEqual({
    UpdateExpression: 'SET #A = :a',
    ExpressionAttributeValues: { ':a': { N: '1' } },
    ExpressionAttributeNames: { '#A': 'name' }
  });
  expect(expr.expr()).toEqual({
    UpdateExpression: 'SET #A = :a',
    ExpressionAttributeValues: { ':a': { N: '1' } },
    ExpressionAttributeNames: { '#A': 'name' }
  });
});

test('updateExpr cannot add clausesupdate expr() is called', () => {
  const expr = updateExpr().set({ foo: 1 });
  expect(expr.expr()).toEqual({
    UpdateExpression: 'SET foo = :a',
    ExpressionAttributeValues: { ':a': { N: '1' } },
  });
  expect(() => expr.set({ bar: 2 })).toThrow(
    'Cannot add clauses (set, remove, add, delete): expr() already called.'
  );
  expect(() => expr.remove('foo')).toThrow(
    'Cannot add clauses (set, remove, add, delete): expr() already called.'
  );
  expect(() => expr.add({ foo: 2 })).toThrow(
    'Cannot add clauses (set, remove, add, delete): expr() already called.'
  );
  expect(() => expr.delete({ baz: 2 })).toThrow(
    'Cannot add clauses (set, remove, add, delete): expr() already called.'
  );
});

test('yoyoma updateExpr avoid duplicate ExpressionAttributeNames', () => {
  const expr0 = updateExpr()
        .set({ w: 1 })
        .set({ x: 2 })
        .add({ y: 3 })
        .expr();
  expect(expr0).toEqual({
    UpdateExpression: 'SET w = :a, x = :b ADD y :c',
    ExpressionAttributeValues: {
      ':a': { N: '1' },
      ':b': { N: '2' },
      ':c': { N: '3' },
    }
  });

  const expr1 = updateExpr()
        .set({ w: 1 })
        .set({ x: 1 })
        .add({ y: 1 })
        .expr();
  expect(expr1).toEqual({
    UpdateExpression: 'SET w = :a, x = :a ADD y :a',
    ExpressionAttributeValues: {
      ':a': { N: '1' }
    }
  });

  const expr2 = updateExpr()
        .set({ w: null })
        .set({ x: null })
        .add({ y: null })
        .expr();
  expect(expr2).toEqual({
    UpdateExpression: 'SET w = :a, x = :a ADD y :a',
    ExpressionAttributeValues: {
      ':a': { NULL: true }
    }
  });
});

test('yoyoma updateExpr allows equality function to avoid duplicate ExpressionAttributeNames', () => {
  const expr0 = updateExpr()
        .set({ w: [1, 2, 3] })
        .set({ x: [1, 2, 3] })
        .expr();
  expect(expr0).toEqual({
    UpdateExpression: 'SET w = :a, x = :b',
    ExpressionAttributeValues: {
      ':a': { NS: ['1', '2', '3'] },
      ':b': { NS: ['1', '2', '3'] }
    }
  });

  // const expr1 = updateExpr()
  //       .set({ w: [1, 2, 3] })
  //       .set({ x: [1, 2, 3] })
  //       .expr();
  // expect(expr1).toEqual({
  //   UpdateExpression: 'SET w = :a, x = :a',
  //   ExpressionAttributeValues: {
  //     ':a': { NS: ['1', '2', '3'] }
  //   }
  // });
});
