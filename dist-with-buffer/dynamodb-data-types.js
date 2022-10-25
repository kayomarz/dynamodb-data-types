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
},{"./errs":5,"./util":10,"buffer":12}],3:[function(require,module,exports){
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

},{"../AttributeValue":2,"unique-sequence":15}],9:[function(require,module,exports){
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
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],12:[function(require,module,exports){
(function (global,Buffer){(function (){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('isarray')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var rootParent = {}

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Safari 5-7 lacks support for changing the `Object.prototype.constructor` property
 *     on objects.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

function typedArraySupport () {
  function Bar () {}
  try {
    var arr = new Uint8Array(1)
    arr.foo = function () { return 42 }
    arr.constructor = Bar
    return arr.foo() === 42 && // typed array instances can be augmented
        arr.constructor === Bar && // constructor can be set
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (arg) {
  if (!(this instanceof Buffer)) {
    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
    if (arguments.length > 1) return new Buffer(arg, arguments[1])
    return new Buffer(arg)
  }

  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    this.length = 0
    this.parent = undefined
  }

  // Common case.
  if (typeof arg === 'number') {
    return fromNumber(this, arg)
  }

  // Slightly less common case.
  if (typeof arg === 'string') {
    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
  }

  // Unusual.
  return fromObject(this, arg)
}

function fromNumber (that, length) {
  that = allocate(that, length < 0 ? 0 : checked(length) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < length; i++) {
      that[i] = 0
    }
  }
  return that
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'

  // Assumption: byteLength() return value is always < kMaxLength.
  var length = byteLength(string, encoding) | 0
  that = allocate(that, length)

  that.write(string, encoding)
  return that
}

function fromObject (that, object) {
  if (Buffer.isBuffer(object)) return fromBuffer(that, object)

  if (isArray(object)) return fromArray(that, object)

  if (object == null) {
    throw new TypeError('must start with number, buffer, array or string')
  }

  if (typeof ArrayBuffer !== 'undefined') {
    if (object.buffer instanceof ArrayBuffer) {
      return fromTypedArray(that, object)
    }
    if (object instanceof ArrayBuffer) {
      return fromArrayBuffer(that, object)
    }
  }

  if (object.length) return fromArrayLike(that, object)

  return fromJsonObject(that, object)
}

function fromBuffer (that, buffer) {
  var length = checked(buffer.length) | 0
  that = allocate(that, length)
  buffer.copy(that, 0, 0, length)
  return that
}

function fromArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Duplicate of fromArray() to keep fromArray() monomorphic.
function fromTypedArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  // Truncating the elements is probably not what people expect from typed
  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
  // of the old Buffer constructor.
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    array.byteLength
    that = Buffer._augment(new Uint8Array(array))
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromTypedArray(that, new Uint8Array(array))
  }
  return that
}

function fromArrayLike (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
// Returns a zero-length buffer for inputs that don't conform to the spec.
function fromJsonObject (that, object) {
  var array
  var length = 0

  if (object.type === 'Buffer' && isArray(object.data)) {
    array = object.data
    length = checked(array.length) | 0
  }
  that = allocate(that, length)

  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
} else {
  // pre-set for values that may exist in the future
  Buffer.prototype.length = undefined
  Buffer.prototype.parent = undefined
}

function allocate (that, length) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = Buffer._augment(new Uint8Array(length))
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that.length = length
    that._isBuffer = true
  }

  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
  if (fromPool) that.parent = rootParent

  return that
}

function checked (length) {
  // Note: cannot use `length < kMaxLength` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (subject, encoding) {
  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

  var buf = new Buffer(subject, encoding)
  delete buf.parent
  return buf
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  var i = 0
  var len = Math.min(x, y)
  while (i < len) {
    if (a[i] !== b[i]) break

    ++i
  }

  if (i !== len) {
    x = a[i]
    y = b[i]
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

  if (list.length === 0) {
    return new Buffer(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; i++) {
      length += list[i].length
    }
  }

  var buf = new Buffer(length)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

function byteLength (string, encoding) {
  if (typeof string !== 'string') string = '' + string

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'binary':
      // Deprecated
      case 'raw':
      case 'raws':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  start = start | 0
  end = end === undefined || end === Infinity ? this.length : end | 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return 0
  return Buffer.compare(this, b)
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
  byteOffset >>= 0

  if (this.length === 0) return -1
  if (byteOffset >= this.length) return -1

  // Negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

  if (typeof val === 'string') {
    if (val.length === 0) return -1 // special case: looking for empty string always fails
    return String.prototype.indexOf.call(this, val, byteOffset)
  }
  if (Buffer.isBuffer(val)) {
    return arrayIndexOf(this, val, byteOffset)
  }
  if (typeof val === 'number') {
    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
    }
    return arrayIndexOf(this, [ val ], byteOffset)
  }

  function arrayIndexOf (arr, val, byteOffset) {
    var foundIndex = -1
    for (var i = 0; byteOffset + i < arr.length; i++) {
      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
      } else {
        foundIndex = -1
      }
    }
    return -1
  }

  throw new TypeError('val must be string, number or Buffer')
}

// `get` is deprecated
Buffer.prototype.get = function get (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` is deprecated
Buffer.prototype.set = function set (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) throw new Error('Invalid hex string')
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    var swap = encoding
    encoding = offset
    offset = length | 0
    length = swap
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'binary':
        return binaryWrite(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function binarySlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
  }

  if (newBuf.length) newBuf.parent = this.parent || this

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
  if (offset < 0) throw new RangeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; i--) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; i++) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), targetStart)
  }

  return len
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new RangeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function _augment (arr) {
  arr.constructor = Buffer
  arr._isBuffer = true

  // save reference to original Uint8Array set method before overwriting
  arr._set = arr.set

  // deprecated
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.indexOf = BP.indexOf
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUIntLE = BP.readUIntLE
  arr.readUIntBE = BP.readUIntBE
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readIntLE = BP.readIntLE
  arr.readIntBE = BP.readIntBE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUIntLE = BP.writeUIntLE
  arr.writeUIntBE = BP.writeUIntBE
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeIntLE = BP.writeIntLE
  arr.writeIntBE = BP.writeIntBE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; i++) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer)
},{"base64-js":11,"buffer":12,"ieee754":14,"isarray":13}],13:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],14:[function(require,module,exports){
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],15:[function(require,module,exports){
const useq = require('./unique-sequence');

module.exports = useq;

},{"./unique-sequence":16}],16:[function(require,module,exports){
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
