(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/* For browserify to create a build for the browser */
window.DynamoDbDataTypes = require('./lib/dynamodb-data-types');

},{"./lib/dynamodb-data-types":4}],2:[function(require,module,exports){
(function (Buffer){(function (){
var isArray = require('./util').isArray;
var errs = require('./errs');

// var DEBUG = false;

var __preserveArrays = false;

function _preserveArrays() {
  __preserveArrays = true;
}

function test(arr, fn) {
  for (var i = 0; i < arr.length; i++) {
    if (!fn(arr[i]))
      return false;
  }
  return true;
}

function isnumber(el) {
  return typeof el === 'number' || el instanceof Number;
}

function isstring(el) {
  return typeof el === 'string' || el instanceof String;
}

function isbinary(el) {
  if (el instanceof Buffer)
    return true;
  return false;
}

function detectType(val) {
  if (isArray(val)) {
    var arr = val;
    if (test(arr, isnumber))
      return 'NS';

    if (test(arr, isstring))
      return 'SS';

    if (test(arr, isbinary))
      return 'BS';

    return 'L';
  }

  if (isstring(val))
    return 'S';

  if (isnumber(val))
    return 'N';

  if (isbinary(val))
    return 'B';

  if (val === null)
    return 'NULL';
  
  if (typeof val === 'boolean')
    return 'BOOL';

  if (typeof val === 'object') {
    return 'M';
  }
}

function explicit_type(opts, key) {

  var type_specified = typeof opts === 'object' &&
        typeof opts.types === 'object' &&
        typeof key === 'string' &&
        typeof opts.types[key] === 'string';

  if (!type_specified)
    return;

  var type = opts.types[key];
  if (typeExists(type))
    return type;
}


var MULTIPLES = ['L', 'BS', 'NS', 'SS'];
function getType(val, opts, key) {
  var explicit = explicit_type(opts, key);
  var detected = detectType(val);

  var type = detected;
  if (isArray(val) && __preserveArrays)
    type = 'L';
  if (MULTIPLES.indexOf(explicit) > -1 && MULTIPLES.indexOf(detected) > -1)
    type = explicit;

  return type;
}

function eachToString(arr) {
  return arr.map(function(v) { 
    return v.toString(); 
  });
}

/**
 * Wrap a single value into DynamoDB's AttributeValue.
 * @param {String|Number|Array}  val The value to wrap.
 * @return {Object} DynamoDB AttributeValue.
 */
function wrap1(val, opts, key) {
  switch(getType(val, opts, key)) {
  case 'B': return {'B': val};
  case 'BS': return {'BS': val};
  case 'N': return {'N': val.toString()};
  case 'NS': return {'NS': eachToString(val)};
  case 'S': return {'S': val.toString()};
  case 'SS': return {'SS': eachToString(val)};
  case 'BOOL': return {'BOOL': val ? true: false};
  case 'L': return {'L': val.map(function(obj){ return wrap1(obj, opts); })};
  case 'M': return {'M': wrap(val, opts)};
  case 'NULL': return {'NULL': true};
  default: return;
  }
}

/**
 *  Wrap object properties into DynamoDB's AttributeValue data type.
 *  @param {Object} obj The object to wrap.
 *  @return {Object} A DynamoDb AttributeValue.
 */
function wrap(obj, opts) {
  var result = {};
  for (var key in obj) {
    if(obj.hasOwnProperty(key)) {
      var wrapped = wrap1(obj[key], opts, key);
      if (typeof wrapped !== 'undefined')
        result[key] = wrapped;
    }
  }
  return result;
}

var unwrapFns = {
  'B': undefined,
  'BS': undefined,
  'N': function (o) { return Number(o); },
  'NS':function (arr) { return arr.map(function(o) {return Number(o);}); },
  'S': undefined,
  'SS': undefined,
  'BOOL': undefined,
  'L': function(val) { return val.map(unwrap1); },
  'M': function (val) { return unwrap(val); },
  'NULL': function() { return null; }
};

function typeExists(type) {
  return unwrapFns.hasOwnProperty(type);
}

/**
 * Unwrap a single DynamoDB's AttributeValue to a value of the appropriate
 * javascript type. 
 * @param {Object} attributeValue The DynamoDB AttributeValue.
 * @return {String|Number|Array}  The javascript value.
 */
function unwrap1(dynamoData) {
  var keys = Object.keys(dynamoData);
  if (keys.length !== 1)
    throw new Error('Unexpected DynamoDB AttributeValue');
  var typeStr = keys[0];
  if (!unwrapFns.hasOwnProperty(typeStr))
    throw errs.NoDatatype;
  var val = dynamoData[typeStr];
  return unwrapFns[typeStr] ? unwrapFns[typeStr](val) : val;
}

/**
 *  Unwrap DynamoDB AttributeValues to values of the appropriate types.
 *  @param {Object} attributeValue The DynamoDb AttributeValue to unwrap.
 *  @return {Object} Unwrapped object with properties.
 */
function unwrap(attrVal) {
  var result = {};
  for (var key in attrVal) {
    if(attrVal.hasOwnProperty(key)) {
      var value = attrVal[key];
      if (value !== null && typeof value !== 'undefined') 
        result[key] = unwrap1(attrVal[key]);
    }
  }
  return result;
}

// function printData(input, result, title) {
//   if (DEBUG) {
//     console.log(title + ' input:');
//     console.log(JSON.stringify(input, undefined, 2));
//     console.log(title + ' result:');
//     console.log(JSON.stringify(result, undefined, 2));
//   }
//   return result;
// }

function wrapDebug(obj, opts) {
  var wrapped = wrap(obj, opts);
  // if (DEBUG)
  //   printData(obj, wrapped, 'wrap');
  return wrapped;
}

function unwrapDebug(attrVal) {
  var unwrapped = unwrap(attrVal);
  // if (DEBUG)
  //   printData(attrVal, unwrapped, 'unwrap');
  return unwrapped;
}

module.exports = {
  wrap: wrapDebug,
  unwrap: unwrapDebug,
  wrap1: wrap1,
  unwrap1: unwrap1,
  _preserveArrays: _preserveArrays
};

}).call(this)}).call(this,require("buffer").Buffer)
},{"./errs":5,"./util":10,"buffer":11}],3:[function(require,module,exports){
var isArray = require('./util').isArray;
var errs = require('./errs');
var attr = require('./AttributeValue');
var util = require('./util');

function isStr(val) {
  return typeof val === "string" || val instanceof String;
}

function hasKeysOnly(attrs) {
  return (attrs && (isStr(attrs) || isArray(attrs))) ? true : false;
}

function appendAttr(action, key, value, updates, opts) {
  if (value !== null && typeof value !== 'undefined')
    updates[key] = {Action: action, Value: attr.wrap1(value, opts, key)};
  else
    updates[key] = {Action: action};
}

/*  Append attributes without a value.
 *  @param {String} action
 *  @param {String|Array} attrs key names sepcified as comma separated string or
 *  as an array of strings.
 *  @param {Updates} updates object.
 */
function appendAttrsKeysOnly(action, attrs, updates, opts) {
  if (typeof attrs === "string" || attrs instanceof String)
    attrs = attrs.split(",");

  if (attrs && isArray(attrs)) {
    for(var i = 0; i < attrs.length; i++) {
      var key = attrs[i];
      if (key && isStr(key)  && key.length > 0)
        appendAttr(action, key.trim(), null, updates, opts);
    }
  }
  return updates;
}

/*
 *  Append action and attributes to the specified updates object.
 */
function appendAttrs(action, attrs, _updates, opts) {
  var updates = isTypeUpdates(this) ? this : (_updates || (new Updates()));

  if (attrs && hasKeysOnly(attrs)) {
    appendAttrsKeysOnly(action, attrs, updates, opts);
  } else if (typeof attrs === "object") {
    util.forIn(attrs, function(value, key) {
      if (value !== null && typeof value !== 'undefined')
        appendAttr(action, key, value, updates, opts);
    });
  }

  return updates;
}

/**
 *  Append attributes to be updated with action "ADD".
 *  This function can be chained with further calls to `add', `put' or `delete'.
 *  @param {Object} attrs Object with attributes to be updated.
 *  @return {Updates} Object with all update attributes in the chain.
 */
function add(attrs, opts) {
  return appendAttrs.call(this, "ADD", attrs, undefined, opts);
}

/**
 *  Append attributes to be updated with action "PUT".
 *  This function can be chained with further calls to `add', `put' or `delete'.
 *  @param {Object} attrs Object with attributes to be updated.
 *  @return {Updates} Object with all update attributes in the chain.
 */
function put(attrs, opts) {
  return appendAttrs.call(this, "PUT", attrs, undefined, opts);
}

/**
 *  Append attributes to be updated with action "DELETE".
 *  This function can be chained with further calls to `add', `put' or `delete'.
 *  @param {Object|String|Array} attrs If this argument is an an Object,
 *  the Object's property values must be an array, containing elements to be
 *  removed, as required by DynamoDb SDK.
 *  If this argument is a String, it should contain comma seperated names of
 *  properties to be deleted.  If its an Array, each array element should be a
 *  property  name to be deleted.
 *  @return {Updates} Object with all update attributes in the chain.
 */
function del(attrs) {
  return appendAttrs.call(this, "DELETE", attrs);
}

module.exports = {
  add: add,
  put: put,
  delete: del, // use del instead of delete as its a reserved keyword.
  isTypeUpdates: isTypeUpdates,
  Updates: Updates
};

function Updates() {
}

function isTypeUpdates(obj) {
  return obj instanceof Updates;
}

function addProp(name, value, target) {
  Object.defineProperty(target, name, {
    value: value,
    writable: false,
    enumerable: false,
    configurable: false
  });
}

addProp("add", add, Updates.prototype);
addProp("put", put, Updates.prototype);
addProp("delete", del, Updates.prototype);

},{"./AttributeValue":2,"./errs":5,"./util":10}],4:[function(require,module,exports){
var attr = require('./AttributeValue');

function preserveArrays() {
  attr._preserveArrays();
}

module.exports = {
  errs: require('./errs'),
  AttributeValue: attr,
  AttributeValueUpdate: require('./AttributeValueUpdate'),
  updateExpr: require('./update-expression').updateExpr,
  preserveArrays: preserveArrays
};

},{"./AttributeValue":2,"./AttributeValueUpdate":3,"./errs":5,"./update-expression":7}],5:[function(require,module,exports){
module.exports = {
    NoDatatype: new Error('No data type (B, BS, N, NS, S, SS).'),
    NoData: new Error('No data')
};

},{}],6:[function(require,module,exports){
const reserved = [
  'ABORT',
  'ABSOLUTE',
  'ACTION',
  'ADD',
  'AFTER',
  'AGENT',
  'AGGREGATE',
  'ALL',
  'ALLOCATE',
  'ALTER',
  'ANALYZE',
  'AND',
  'ANY',
  'ARCHIVE',
  'ARE',
  'ARRAY',
  'AS',
  'ASC',
  'ASCII',
  'ASENSITIVE',
  'ASSERTION',
  'ASYMMETRIC',
  'AT',
  'ATOMIC',
  'ATTACH',
  'ATTRIBUTE',
  'AUTH',
  'AUTHORIZATION',
  'AUTHORIZE',
  'AUTO',
  'AVG',
  'BACK',
  'BACKUP',
  'BASE',
  'BATCH',
  'BEFORE',
  'BEGIN',
  'BETWEEN',
  'BIGINT',
  'BINARY',
  'BIT',
  'BLOB',
  'BLOCK',
  'BOOLEAN',
  'BOTH',
  'BREADTH',
  'BUCKET',
  'BULK',
  'BY',
  'BYTE',
  'CALL',
  'CALLED',
  'CALLING',
  'CAPACITY',
  'CASCADE',
  'CASCADED',
  'CASE',
  'CAST',
  'CATALOG',
  'CHAR',
  'CHARACTER',
  'CHECK',
  'CLASS',
  'CLOB',
  'CLOSE',
  'CLUSTER',
  'CLUSTERED',
  'CLUSTERING',
  'CLUSTERS',
  'COALESCE',
  'COLLATE',
  'COLLATION',
  'COLLECTION',
  'COLUMN',
  'COLUMNS',
  'COMBINE',
  'COMMENT',
  'COMMIT',
  'COMPACT',
  'COMPILE',
  'COMPRESS',
  'CONDITION',
  'CONFLICT',
  'CONNECT',
  'CONNECTION',
  'CONSISTENCY',
  'CONSISTENT',
  'CONSTRAINT',
  'CONSTRAINTS',
  'CONSTRUCTOR',
  'CONSUMED',
  'CONTINUE',
  'CONVERT',
  'COPY',
  'CORRESPONDING',
  'COUNT',
  'COUNTER',
  'CREATE',
  'CROSS',
  'CUBE',
  'CURRENT',
  'CURSOR',
  'CYCLE',
  'DATA',
  'DATABASE',
  'DATE',
  'DATETIME',
  'DAY',
  'DEALLOCATE',
  'DEC',
  'DECIMAL',
  'DECLARE',
  'DEFAULT',
  'DEFERRABLE',
  'DEFERRED',
  'DEFINE',
  'DEFINED',
  'DEFINITION',
  'DELETE',
  'DELIMITED',
  'DEPTH',
  'DEREF',
  'DESC',
  'DESCRIBE',
  'DESCRIPTOR',
  'DETACH',
  'DETERMINISTIC',
  'DIAGNOSTICS',
  'DIRECTORIES',
  'DISABLE',
  'DISCONNECT',
  'DISTINCT',
  'DISTRIBUTE',
  'DO',
  'DOMAIN',
  'DOUBLE',
  'DROP',
  'DUMP',
  'DURATION',
  'DYNAMIC',
  'EACH',
  'ELEMENT',
  'ELSE',
  'ELSEIF',
  'EMPTY',
  'ENABLE',
  'END',
  'EQUAL',
  'EQUALS',
  'ERROR',
  'ESCAPE',
  'ESCAPED',
  'EVAL',
  'EVALUATE',
  'EXCEEDED',
  'EXCEPT',
  'EXCEPTION',
  'EXCEPTIONS',
  'EXCLUSIVE',
  'EXEC',
  'EXECUTE',
  'EXISTS',
  'EXIT',
  'EXPLAIN',
  'EXPLODE',
  'EXPORT',
  'EXPRESSION',
  'EXTENDED',
  'EXTERNAL',
  'EXTRACT',
  'FAIL',
  'FALSE',
  'FAMILY',
  'FETCH',
  'FIELDS',
  'FILE',
  'FILTER',
  'FILTERING',
  'FINAL',
  'FINISH',
  'FIRST',
  'FIXED',
  'FLATTERN',
  'FLOAT',
  'FOR',
  'FORCE',
  'FOREIGN',
  'FORMAT',
  'FORWARD',
  'FOUND',
  'FREE',
  'FROM',
  'FULL',
  'FUNCTION',
  'FUNCTIONS',
  'GENERAL',
  'GENERATE',
  'GET',
  'GLOB',
  'GLOBAL',
  'GO',
  'GOTO',
  'GRANT',
  'GREATER',
  'GROUP',
  'GROUPING',
  'HANDLER',
  'HASH',
  'HAVE',
  'HAVING',
  'HEAP',
  'HIDDEN',
  'HOLD',
  'HOUR',
  'IDENTIFIED',
  'IDENTITY',
  'IF',
  'IGNORE',
  'IMMEDIATE',
  'IMPORT',
  'IN',
  'INCLUDING',
  'INCLUSIVE',
  'INCREMENT',
  'INCREMENTAL',
  'INDEX',
  'INDEXED',
  'INDEXES',
  'INDICATOR',
  'INFINITE',
  'INITIALLY',
  'INLINE',
  'INNER',
  'INNTER',
  'INOUT',
  'INPUT',
  'INSENSITIVE',
  'INSERT',
  'INSTEAD',
  'INT',
  'INTEGER',
  'INTERSECT',
  'INTERVAL',
  'INTO',
  'INVALIDATE',
  'IS',
  'ISOLATION',
  'ITEM',
  'ITEMS',
  'ITERATE',
  'JOIN',
  'KEY',
  'KEYS',
  'LAG',
  'LANGUAGE',
  'LARGE',
  'LAST',
  'LATERAL',
  'LEAD',
  'LEADING',
  'LEAVE',
  'LEFT',
  'LENGTH',
  'LESS',
  'LEVEL',
  'LIKE',
  'LIMIT',
  'LIMITED',
  'LINES',
  'LIST',
  'LOAD',
  'LOCAL',
  'LOCALTIME',
  'LOCALTIMESTAMP',
  'LOCATION',
  'LOCATOR',
  'LOCK',
  'LOCKS',
  'LOG',
  'LOGED',
  'LONG',
  'LOOP',
  'LOWER',
  'MAP',
  'MATCH',
  'MATERIALIZED',
  'MAX',
  'MAXLEN',
  'MEMBER',
  'MERGE',
  'METHOD',
  'METRICS',
  'MIN',
  'MINUS',
  'MINUTE',
  'MISSING',
  'MOD',
  'MODE',
  'MODIFIES',
  'MODIFY',
  'MODULE',
  'MONTH',
  'MULTI',
  'MULTISET',
  'NAME',
  'NAMES',
  'NATIONAL',
  'NATURAL',
  'NCHAR',
  'NCLOB',
  'NEW',
  'NEXT',
  'NO',
  'NONE',
  'NOT',
  'NULL',
  'NULLIF',
  'NUMBER',
  'NUMERIC',
  'OBJECT',
  'OF',
  'OFFLINE',
  'OFFSET',
  'OLD',
  'ON',
  'ONLINE',
  'ONLY',
  'OPAQUE',
  'OPEN',
  'OPERATOR',
  'OPTION',
  'OR',
  'ORDER',
  'ORDINALITY',
  'OTHER',
  'OTHERS',
  'OUT',
  'OUTER',
  'OUTPUT',
  'OVER',
  'OVERLAPS',
  'OVERRIDE',
  'OWNER',
  'PAD',
  'PARALLEL',
  'PARAMETER',
  'PARAMETERS',
  'PARTIAL',
  'PARTITION',
  'PARTITIONED',
  'PARTITIONS',
  'PATH',
  'PERCENT',
  'PERCENTILE',
  'PERMISSION',
  'PERMISSIONS',
  'PIPE',
  'PIPELINED',
  'PLAN',
  'POOL',
  'POSITION',
  'PRECISION',
  'PREPARE',
  'PRESERVE',
  'PRIMARY',
  'PRIOR',
  'PRIVATE',
  'PRIVILEGES',
  'PROCEDURE',
  'PROCESSED',
  'PROJECT',
  'PROJECTION',
  'PROPERTY',
  'PROVISIONING',
  'PUBLIC',
  'PUT',
  'QUERY',
  'QUIT',
  'QUORUM',
  'RAISE',
  'RANDOM',
  'RANGE',
  'RANK',
  'RAW',
  'READ',
  'READS',
  'REAL',
  'REBUILD',
  'RECORD',
  'RECURSIVE',
  'REDUCE',
  'REF',
  'REFERENCE',
  'REFERENCES',
  'REFERENCING',
  'REGEXP',
  'REGION',
  'REINDEX',
  'RELATIVE',
  'RELEASE',
  'REMAINDER',
  'RENAME',
  'REPEAT',
  'REPLACE',
  'REQUEST',
  'RESET',
  'RESIGNAL',
  'RESOURCE',
  'RESPONSE',
  'RESTORE',
  'RESTRICT',
  'RESULT',
  'RETURN',
  'RETURNING',
  'RETURNS',
  'REVERSE',
  'REVOKE',
  'RIGHT',
  'ROLE',
  'ROLES',
  'ROLLBACK',
  'ROLLUP',
  'ROUTINE',
  'ROW',
  'ROWS',
  'RULE',
  'RULES',
  'SAMPLE',
  'SATISFIES',
  'SAVE',
  'SAVEPOINT',
  'SCAN',
  'SCHEMA',
  'SCOPE',
  'SCROLL',
  'SEARCH',
  'SECOND',
  'SECTION',
  'SEGMENT',
  'SEGMENTS',
  'SELECT',
  'SELF',
  'SEMI',
  'SENSITIVE',
  'SEPARATE',
  'SEQUENCE',
  'SERIALIZABLE',
  'SESSION',
  'SET',
  'SETS',
  'SHARD',
  'SHARE',
  'SHARED',
  'SHORT',
  'SHOW',
  'SIGNAL',
  'SIMILAR',
  'SIZE',
  'SKEWED',
  'SMALLINT',
  'SNAPSHOT',
  'SOME',
  'SOURCE',
  'SPACE',
  'SPACES',
  'SPARSE',
  'SPECIFIC',
  'SPECIFICTYPE',
  'SPLIT',
  'SQL',
  'SQLCODE',
  'SQLERROR',
  'SQLEXCEPTION',
  'SQLSTATE',
  'SQLWARNING',
  'START',
  'STATE',
  'STATIC',
  'STATUS',
  'STORAGE',
  'STORE',
  'STORED',
  'STREAM',
  'STRING',
  'STRUCT',
  'STYLE',
  'SUB',
  'SUBMULTISET',
  'SUBPARTITION',
  'SUBSTRING',
  'SUBTYPE',
  'SUM',
  'SUPER',
  'SYMMETRIC',
  'SYNONYM',
  'SYSTEM',
  'TABLE',
  'TABLESAMPLE',
  'TEMP',
  'TEMPORARY',
  'TERMINATED',
  'TEXT',
  'THAN',
  'THEN',
  'THROUGHPUT',
  'TIME',
  'TIMESTAMP',
  'TIMEZONE',
  'TINYINT',
  'TO',
  'TOKEN',
  'TOTAL',
  'TOUCH',
  'TRAILING',
  'TRANSACTION',
  'TRANSFORM',
  'TRANSLATE',
  'TRANSLATION',
  'TREAT',
  'TRIGGER',
  'TRIM',
  'TRUE',
  'TRUNCATE',
  'TTL',
  'TUPLE',
  'TYPE',
  'UNDER',
  'UNDO',
  'UNION',
  'UNIQUE',
  'UNIT',
  'UNKNOWN',
  'UNLOGGED',
  'UNNEST',
  'UNPROCESSED',
  'UNSIGNED',
  'UNTIL',
  'UPDATE',
  'UPPER',
  'URL',
  'USAGE',
  'USE',
  'USER',
  'USERS',
  'USING',
  'UUID',
  'VACUUM',
  'VALUE',
  'VALUED',
  'VALUES',
  'VARCHAR',
  'VARIABLE',
  'VARIANCE',
  'VARINT',
  'VARYING',
  'VIEW',
  'VIEWS',
  'VIRTUAL',
  'VOID',
  'WAIT',
  'WHEN',
  'WHENEVER',
  'WHERE',
  'WHILE',
  'WINDOW',
  'WITH',
  'WITHIN',
  'WITHOUT',
  'WORK',
  'WRAPPED',
  'WRITE',
  'YEAR',
  'ZONE ',
];

function isReservedKeyword(str) {
  return reserved.indexOf(str.toUpperCase()) > -1;
}

module.exports.isReservedKeyword = isReservedKeyword;

},{}],7:[function(require,module,exports){
const { updateExpr } = require('./update-expression');

module.exports.updateExpr = updateExpr;

},{"./update-expression":9}],8:[function(require,module,exports){
const { generatorAlphaLower, generatorAlphaUpper } = require('unique-sequence');

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

},{"../AttributeValue":2,"unique-sequence":12}],9:[function(require,module,exports){
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

},{"../reserved-keywords":6,"./update-expression-ref":8}],10:[function(require,module,exports){
/*
 * For each non-inherited, enumarable property, the callback is invoked with
 * arguments: (value, key, object).
 * @param {Object} The object.
 * @param {Function} The function called for each iteration with
 * arguments(value, key, object)
 */
function forIn(obj, fn) {
    var keys = Object.keys(obj);
    var len = keys.length;
    for(var i = 0; i < len; i++) {
      var key = keys[i];
      fn(obj[key], key, obj);
    }
}


var isArray = Array.isArray || function(arg) {
  return Object.prototype.toString.call(arg) === '[object Array]';
};


module.exports = {
  forIn: forIn,
  isArray: isArray
};

},{}],11:[function(require,module,exports){

},{}],12:[function(require,module,exports){
const useq = require('./unique-sequence');

module.exports = useq;

},{"./unique-sequence":13}],13:[function(require,module,exports){
const NUM = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

const ALPHA_UPPER = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
];

const ALPHA_LOWER = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
];

const ALPHA_NUM_UPPER = [...NUM, ...ALPHA_UPPER];

const ALPHA_NUM_LOWER = [...NUM, ...ALPHA_LOWER];

function generator(list) {
  const MIN_LEN = 2;
  const MAX_LEN = 36;
  const len = list.length;
  if (len < MIN_LEN) {
    throw new Error(`mininum list length is ${MIN_LEN}, got ${len}.`);
  }
  if (len > MAX_LEN) {
    throw new Error(`maximum list length is ${MAX_LEN}, got ${len}.`);
  }
  let count = 0;
  return function* gen() {
    while (true) {
      const strIndices = [...count.toString(len)];
      const indices = strIndices.map(num => parseInt(num, len));
      const val = indices.map(i => list[i]).join('');
      yield val;
      count++;
    }
  };
}

function generatorCustom(list) { return generator(list)(); }
function generatorNum() { return generator(NUM)(); }
function generatorAlphaUpper() { return generator(ALPHA_UPPER)(); }
function generatorAlphaLower() { return generator(ALPHA_LOWER)(); }
function generatorAlphaNumUpper() { return generator(ALPHA_NUM_UPPER)(); }
function generatorAlphaNumLower() { return generator(ALPHA_NUM_LOWER)(); }

module.exports.generatorCustom = generatorCustom;
module.exports.generatorNum = generatorNum;
module.exports.generatorAlphaUpper = generatorAlphaUpper;
module.exports.generatorAlphaLower = generatorAlphaLower;
module.exports.generatorAlphaNumUpper = generatorAlphaNumUpper;
module.exports.generatorAlphaNumLower = generatorAlphaNumLower;

},{}]},{},[1]);
