"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseEntity = exports.default = void 0;
var _mapValues = _interopRequireDefault(require("lodash/mapValues"));
var _utils = require("./utils");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const argumentType = (opt, returnsOptionsParam) => {
  if (returnsOptionsParam || !opt) {
    return 'options';
  }
  const keys = Object.keys(opt);
  return `{ ${keys.join(', ')} }`;
};
const parseFunction = (options, expression, returnsOptionsParam) => {
  try {
    return new Function(argumentType(options, returnsOptionsParam), `return ${expression}`)(options);
  } catch (e) {
    console.error(`Failed to parse expression <${expression}>`, e);
    return undefined;
  }
};
const parseKeyExpression = repeat => function (key) {
  let override = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  if (override && typeof override === 'function') {
    return override(key);
  }
  return key.repeat(repeat);
};

/**
 * This regex allows the parsing of multiple get commands in a string.
 * e.g. `@prop1 is a dynamic property, same with @prop2` => `value1 is a dynamic property, same with undefined`
 */
const parseRegex = key => new RegExp(`(\\${key})([^\\${key}\\s[\\]][-\\w\\d]*(\\.\\w+)*)(?=[^-\\w\\d]{0,})`, 'gi');
const initializeParserKeys = (id, config) => {
  const {
    parseKey = '@',
    overrideFunctionStart = null,
    overrideFunctionStartOptions = null,
    overrideParserIgnore = null,
    overrideParseChild = null,
    overrideParseJSX = null
  } = config;
  return {
    PARSE_KEY: parseKey,
    FUNCTION_START: parseKeyExpression(2)(parseKey, overrideFunctionStart),
    FUNCTION_START_OPTIONS: parseKeyExpression(3)(parseKey, overrideFunctionStartOptions),
    PARSE_REGEX: parseRegex(parseKey),
    PARSE_IGNORE: parseKeyExpression()(parseKey, overrideParserIgnore || (k => `!${k}`)),
    PARSE_CHILD: parseKeyExpression()(parseKey, overrideParseChild || (k => `${k}child`)),
    PARSE_JSX: parseKeyExpression()(parseKey, overrideParseJSX || (k => `${k}jsx`)),
    INSTANCE_ID: id || ''
  };
};

/**
 * Tokens that define string function parsing behavior.
 * @param {} parserTokens
 */
const parseEntity = (parserTokens, children) => {
  const {
    PARSE_KEY,
    FUNCTION_START,
    FUNCTION_START_OPTIONS,
    PARSE_REGEX,
    PARSE_IGNORE,
    PARSE_CHILD
  } = parserTokens;

  /**
   * Parses a function expression to format (options) => exp, where options is passed in later
   * @param {string} expression to parse
   */
  const parser = (exp, options) => {
    const expression = exp.trim();
    if (expression.startsWith(FUNCTION_START)) {
      const returnsOptionsParam = expression.startsWith(FUNCTION_START_OPTIONS);
      const tokenLength = returnsOptionsParam ? FUNCTION_START_OPTIONS.length : FUNCTION_START.length;
      return parseFunction(options, expression.slice(tokenLength).trim(), returnsOptionsParam);
    }
    if (expression.startsWith(PARSE_IGNORE)) {
      return expression.slice(PARSE_IGNORE.length);
    }
    if (expression.startsWith(PARSE_CHILD)) {
      const childIndex = expression.slice(PARSE_CHILD.length).trim();
      if (children[childIndex]) {
        return children[childIndex];
      }
      return null;
    }
    if (expression.includes(PARSE_KEY)) {
      const property = expression.replace(PARSE_REGEX, match => match.slice(PARSE_KEY.length));
      return (0, _utils.getOrHas)(options, 'get')(property);
    }
    return expression;
  };
  return parser;
};
exports.parseEntity = parseEntity;
const parseExpression = (id, config, children) => {
  const parseKeys = initializeParserKeys(id, config);
  const parser = parseEntity(parseKeys, children);

  /**
   * Processes any deep data structure
   * @param {any} options 'props' supplied by external consumer or helpers provided for use
   * @param {any} expression data structure to parse
   */
  const expressionIterator = options => expression => {
    const expType = (0, _utils.prim)(expression);
    if (expType === 'array') {
      return expression.map(v => expressionIterator(options)(v));
    }
    if (expType === 'object') {
      return (0, _mapValues.default)(expression, expressionIterator(options));
    }
    if (expType === 'string') return parser(expression, options);
    return expression;
  };
  return [expressionIterator, parseKeys];
};
var _default = parseExpression;
exports.default = _default;