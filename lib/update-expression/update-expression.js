const { isReservedKeyword } = require('../reserved-keywords');
const { refsForUpdateExpr } = require('./update-expression-ref');

/*
 * A `UpdateExpression` clause begin with `SET`, `REMOVE`, `ADD` or `DELETE`,
 * each of which accepts one ore more `action`.
 *
 * docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.UpdateExpressions.html
 *
 */
function updateExpr() {
  const INPUT = { SET: [], REMOVE: [], ADD: [], DELETE: [] };
  const { valueRefs, nameRefs } = refsForUpdateExpr();
  let finishedExpr;

  function errorIfFinished() {
    if (finishedExpr) {
      throw new Error(
        'expr() already called: cannot use clauses (set,remove,add,delete)'
      );
    }
  }

  return Object.create({
    set(obj) {
      errorIfFinished();
      INPUT.SET.push(...Object.entries(obj));
      return this;
    },
    remove(...names) {
      errorIfFinished();
      INPUT.REMOVE.push(...names);
      return this;
    },
    add(obj) {
      errorIfFinished();
      INPUT.ADD.push(...Object.entries(obj));
      return this;
    },
    delete(obj) {
      errorIfFinished();
      INPUT.DELETE.push(...Object.entries(obj));
      return this;
    },
    expr() {
      if (finishedExpr) {
        return finishedExpr;
      }
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
      if (valueRefs.length) {
        result.ExpressionAttributeValues = Object.fromEntries(valueRefs.items);
      }
      if (nameRefs.length) {
        result.ExpressionAttributeNames = Object.fromEntries(nameRefs.items);
      }
      finishedExpr = result;
      return result;
    },
  });

  function mkClause0(clauseName) {
    const actions = INPUT[clauseName]
          .reduce((xs, str) => {
            str.indexOf(',') > -1 ? xs.push.apply(xs, str.split(',')) : xs.push(str);
            return xs;
          }, [])
          .map(key => isReservedKeyword(key) ? nameRefs.makeRef(key) : key);
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
              const ref = nameRefs.makeRef(key);
              return [ref, val];
            }
            return [key, val];
          })
          .map(([key, val]) => {
            const ref = valueRefs.makeRef(val);
            return fnAction(key, ref);
          });
    return [actions, refs];
  }
}

module.exports.updateExpr = updateExpr;
