"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _utils = require("./utils");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const ERROR_INVALID_ANCHOR_TYPE = 'In template render, Array element[0] must be a string representing a component and array element[1] may be a props object for the component. If array element[1] is not a props object, then element[1] to remaining array elements will be rendered as children of element[0].';
const BASIC_ELEMENT_TYPES = ['null', 'undefined', 'number', 'string'];
const FRAGMENT_TYPES = ['React.Fragment', 'Fragment'];
const isProps = obj => {
  const has = (0, _utils.getOrHas)(obj);
  return (0, _utils.prim)(obj) === 'object' && !(has('condition') && has('render'));
};
const getFirstTwoElements = _ref => {
  let [root, props] = _ref;
  if ((0, _utils.prim)(root) === 'string') {
    return `ElementWith${isProps(props) ? '' : 'out'}Props`;
  }
  if (root === null || FRAGMENT_TYPES.includes(root)) {
    return `FragmentWith${isProps(props) ? '' : 'out'}Props`;
  }
  return 'Error';
};
const handleArray = (Compound, parserKeys) => (arr, numericKey) => {
  const firstTwo = arr.slice(0, 2);
  const result = getFirstTwoElements(firstTwo);
  const key = `${parserKeys.INSTANCE_ID}${numericKey}`;
  if (result === 'Error') {
    console.error(ERROR_INVALID_ANCHOR_TYPE);
    return null;
  }
  if (result.startsWith('Fragment')) {
    const childElements = arr.slice(result === 'FragmentWithoutProps' ? 1 : 2);
    return /*#__PURE__*/_react.default.createElement(Compound.AnchorComponent, {
      key: key,
      Component: _react.default.Fragment
    }, childElements.map((element, index) => parseTemplate(Compound, parserKeys)(element, `${numericKey}${index}`)));
  }
  let elementProps = {};
  if (result === 'ElementWithProps') {
    elementProps = arr[1];
  }
  const childElements = arr.slice(result === 'ElementWithoutProps' ? 1 : 2);
  return /*#__PURE__*/_react.default.createElement(Compound.AnchorComponent, {
    key: key,
    component: arr[0],
    componentProps: elementProps || {}
  }, childElements.map((element, index) => parseTemplate(Compound, parserKeys)(element, `${numericKey}${index}`)));
};
const parseTemplate = (Compound, parserKeys) => {
  const parseAnchorArray = handleArray(Compound, parserKeys);
  const parser = function (element) {
    let numericKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    const elementKey = `${parserKeys.INSTANCE_ID}${numericKey}`;
    const elType = (0, _utils.prim)(element);
    const get = (0, _utils.getOrHas)(element, 'get');
    const has = (0, _utils.getOrHas)(element);
    const parse = parseTemplate(Compound, parserKeys);
    if (elType === 'array') {
      return parseAnchorArray(element, numericKey);
    }
    if (has('condition') && has('render')) {
      const childrenWhenTrue = parse(get('render[0]'));
      const childrenWhenFalse = parse(get('render[1]'));
      return /*#__PURE__*/_react.default.createElement(Compound.ConditionalRenderer, {
        key: elementKey,
        condition: element.condition,
        childrenWhenTrue: childrenWhenTrue,
        childrenWhenFalse: childrenWhenFalse
      });
    }
    if (elType === 'string' && element.startsWith(parserKeys.PARSE_JSX)) {
      const jsxExpression = element.slice(parserKeys.PARSE_JSX.length);
      return /*#__PURE__*/_react.default.createElement(Compound.JSXElement, {
        key: elementKey,
        element: jsxExpression
      });
    }
    if (elType === 'string' && element.startsWith(parserKeys.PARSE_CHILD)) {
      return /*#__PURE__*/_react.default.createElement(Compound.ReactChildClone, {
        key: elementKey,
        parentKey: elementKey,
        element: element
      });
    }
    if (BASIC_ELEMENT_TYPES.includes(elType)) {
      return /*#__PURE__*/_react.default.createElement(Compound.BasicElement, {
        key: elementKey,
        element: element
      });
    }
    throw new Error(`${JSON.stringify(element)} is not a supported type.`);
  };
  return parser;
};
var _default = parseTemplate;
exports.default = _default;
module.exports = exports.default;