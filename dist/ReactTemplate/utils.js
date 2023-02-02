"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.prim = exports.getOrHas = void 0;
var _get = _interopRequireDefault(require("lodash/get"));
var _has = _interopRequireDefault(require("lodash/has"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const isArray = v => Array.isArray(v);
const isObject = obj => obj && typeof obj === 'object' && obj.constructor === Object;
const isString = v => typeof v === 'string';
const isNull = v => v === null;

/**
 * lodash object utility to get property ('get') or check ('has') if object has property
 * @param {any} obj object to get or check from
 * @param {string | string[]} property property to get or check inside object
 * @param {'get' | 'has'} type uses 'has' by default
 */
const getOrHas = function (obj) {
  let type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'has';
  if (type === 'getOrHas') return {
    get: _get.default,
    has: _has.default
  };
  return type === 'get' ? _get.default.bind(null, obj) : _has.default.bind(null, obj);
};
exports.getOrHas = getOrHas;
const primitiveList = [{
  function: isArray,
  type: 'array'
}, {
  function: isObject,
  type: 'object'
}, {
  function: isString,
  type: 'string'
}, {
  function: isNull,
  type: 'null'
}];

/**
 * Returns primitive type of item
 * @param {any} item
 * @returns {'array' | 'boolean' | 'function' | 'number' | 'null' | 'object' | 'string' | 'undefined'} string primitive of item
 */
const prim = item => {
  for (let i = 0; i < primitiveList.length; i += 1) {
    const currentPrimitive = primitiveList[i];
    if (currentPrimitive.function(item)) {
      return currentPrimitive.type;
    }
  }
  return typeof item;
};
exports.prim = prim;