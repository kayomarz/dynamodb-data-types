#!/usr/bin/env node

'use strict';

const attr = require('../lib/dynamodb-data-types').AttributeValue;
const content = process.argv[2];

if (!content) {
  throw new Error('Input data required.')
}

let payload = '';
try {
  payload = JSON.parse(content);
}
catch (err) {
  payload = content
}
const output = attr.unwrap(payload);

if (typeof output === 'object') {
  process.stdout.write(JSON.stringify(output) + '\n');
}
else {
  process.stdout.write(output + '\n');
}
