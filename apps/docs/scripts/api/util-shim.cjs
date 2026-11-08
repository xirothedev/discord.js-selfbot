const util = require('node:util');

const types = {
  isArray: Array.isArray,
  isBoolean: (value) => typeof value === 'boolean',
  isBuffer: Buffer.isBuffer,
  isDate: (value) => value instanceof Date,
  isError: (value) => value instanceof Error,
  isFunction: (value) => typeof value === 'function',
  isNull: (value) => value === null,
  isNullOrUndefined: (value) => value == null,
  isNumber: (value) => typeof value === 'number',
  isObject: (value) => typeof value === 'object' && value !== null,
  isPrimitive: (value) => value === null || (typeof value !== 'object' && typeof value !== 'function'),
  isRegExp: (value) => value instanceof RegExp,
  isString: (value) => typeof value === 'string',
  isSymbol: (value) => typeof value === 'symbol',
  isUndefined: (value) => value === undefined,
};

for (const [key, fn] of Object.entries(types)) {
  if (typeof util[key] !== 'function') util[key] = fn;
}
