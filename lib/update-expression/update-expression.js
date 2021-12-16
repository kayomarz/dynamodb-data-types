var attr = require('../AttributeValue');
const {
  generatorAlphaLower,
  generatorAlphaUpper
} = require('./unique-sequences');

const { isReservedKeyword } = require('../reserved-keywords');

function updateExpr() {
  const INPUT = {
    SET: [],
    REMOVE: [],
    ADD: [],
    DELETE: [],
  };

  const genPlaceholder = generatorAlphaLower();

  const substitues = [];
  const genSubstitue = generatorAlphaUpper();

  return Object.create({
    set(obj) {
      INPUT.SET.push(...Object.entries(obj));
      return this;
    },
    remove(csvNames) {
      const names = csvNames.split(',').map(s => s.trim());
      INPUT.REMOVE.push(...names.map(n => [n]));
      return this;
    },
    add(obj) {
      INPUT.ADD.push(...Object.entries(obj));
      return this;
    },
    delete(obj) {
      INPUT.DELETE.push(...Object.entries(obj));
      return this;
    },
    expr() {
      const exprs = [];
      const refs = [];
      const out = [
        mkClause('SET', (name, ref) => `${name} = ${ref}`),
        mkClause0('REMOVE'),
        mkClause('ADD', (name, ref) => `${name} ${ref}`),
        mkClause('DELETE', (name, ref) => `${name} ${ref}`),
      ];
      for (const [e, r] of out) {
        if (e) { exprs.push(e); }
        refs.push(...r);
      }
      const result = { UpdateExpression: exprs.join(' ') };
      if (refs.length) {
        result.ExpressionAttributeValues = Object.fromEntries(refs);
      }
      if (substitues.length) {
        result.ExpressionAttributeNames = Object.fromEntries(substitues);
      }
      return result;
    },
  });

  function mkClause0(clauseName) {
    const actions = INPUT[clauseName];
    const clause = actions.length && `${clauseName} ${actions.join(', ')}`;
    return [clause, []];
  }

  function mkClause(clauseName, fnAction) {
    const keyVals = INPUT[clauseName];
    const [actions, refs] = mkActions(keyVals, fnAction);
    const clause = actions.length && `${clauseName} ${actions.join(', ')}`;
    return [clause, refs];
  }

  function mkActions(keyVals, fnAction) {
    const refs = [];
    const actions = keyVals
          .filter(([, val]) => typeof val !== 'undefined')
          .map(([key, val]) => {
            if (isReservedKeyword(key)) {
              const s = `#${genSubstitue.next().value}`;
              substitues.push([s, key]);
              return [s, val];
            }
            return [key, val];
          })
          .map(([key, val]) => {
            const ref = `:${genPlaceholder.next().value}`;
            refs.push([ref, attr.wrap1(val)]);
            return fnAction(key, ref);
          });
    return [actions, refs];
  }
}

module.exports.updateExpr = updateExpr;
