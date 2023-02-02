import get from 'lodash/get';
import has from 'lodash/has';

const isArray = (v) => Array.isArray(v);
const isObject = (obj) =>
    obj && typeof obj === 'object' && obj.constructor === Object;
const isString = (v) => typeof v === 'string';
const isNull = (v) => v === null;

/**
 * lodash object utility to get property ('get') or check ('has') if object has property
 * @param {any} obj object to get or check from
 * @param {string | string[]} property property to get or check inside object
 * @param {'get' | 'has'} type uses 'has' by default
 */
export const getOrHas = (obj, type = 'has') => {
    if (type === 'getOrHas') return { get, has };

    return type === 'get' ? get.bind(null, obj) : has.bind(null, obj);
};

const primitiveList = [
    {
        function: isArray,
        type: 'array',
    },
    {
        function: isObject,
        type: 'object',
    },
    {
        function: isString,
        type: 'string',
    },
    {
        function: isNull,
        type: 'null',
    },
];

/**
 * Returns primitive type of item
 * @param {any} item
 * @returns {'array' | 'boolean' | 'function' | 'number' | 'null' | 'object' | 'string' | 'undefined'} string primitive of item
 */
export const prim = (item) => {
    for (let i = 0; i < primitiveList.length; i += 1) {
        const currentPrimitive = primitiveList[i];
        if (currentPrimitive.function(item)) {
            return currentPrimitive.type;
        }
    }

    return typeof item;
};
