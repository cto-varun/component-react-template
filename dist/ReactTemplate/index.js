"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var _reactJsxParser = _interopRequireDefault(require("react-jsx-parser"));
var _react2 = require("@emotion/react");
var _context = _interopRequireWildcard(require("../context"));
var _useRegister = _interopRequireDefault(require("./hooks/useRegister"));
var _utils = require("./utils");
var _parseTemplate = _interopRequireDefault(require("./parseTemplate"));
var _parseExpression = _interopRequireDefault(require("./parseExpression"));
var _reactRouterDom = require("react-router-dom");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/** @jsx jsx */

const getAnchorComponent = parser => _ref => {
  let {
    component,
    componentProps = {},
    children
  } = _ref;
  const {
    context,
    dispatch,
    components,
    modules
  } = (0, _context.useTemplateContext)();
  const [Component, setComponent] = (0, _react.useState)();
  const [anchorProps, setAnchorProps] = (0, _react.useState)({});
  const options = (0, _react.useMemo)(() => ({
    ...context,
    ...modules,
    dispatch
  }), [context, modules]);
  (0, _react.useEffect)(() => {
    if (component === null || ['React.Fragment', 'Fragment'].includes(component)) {
      setComponent(() => _react.default.Fragment);
    } else if (!Component) {
      const element = (0, _utils.getOrHas)(components, 'get')(component) || component || _react.default.Fragment;
      setComponent(() => element);
    }
  }, [component]);
  (0, _react.useEffect)(() => {
    let props = parser(componentProps, options) || {};
    if (props.css) {
      props = {
        ...props,
        css: (0, _utils.prim)(props.css) === 'object' ? (0, _react2.css)(props.css) : (0, _react2.css)`
                              ${props.css}
                          `
      };
    }
    setAnchorProps(props);
  }, [options]);
  return Component ? (0, _react2.jsx)(Component, anchorProps, children) : null;
};
const getBasicElement = parser => _ref2 => {
  let {
    element
  } = _ref2;
  const {
    context,
    dispatch,
    modules
  } = (0, _context.useTemplateContext)();
  const options = (0, _react.useMemo)(() => ({
    ...context,
    ...modules,
    dispatch
  }), [context, modules]);
  const [expressionFunction, setExpressionFunction] = (0, _react.useState)();
  (0, _react.useEffect)(() => {
    const result = parser(element, options);
    setExpressionFunction(result);
  }, [options]);
  return expressionFunction ? expressionFunction || null : null;
};
const getConditionalRenderer = parser => _ref3 => {
  let {
    condition,
    childrenWhenTrue,
    childrenWhenFalse
  } = _ref3;
  const {
    context,
    dispatch,
    modules
  } = (0, _context.useTemplateContext)();
  const options = (0, _react.useMemo)(() => ({
    ...context,
    ...modules,
    dispatch
  }), [context, modules]);
  const [expressionCondition, setExpressionCondition] = (0, _react.useState)();
  (0, _react.useLayoutEffect)(() => {
    const result = parser(condition, options);
    setExpressionCondition(result);
  }, [options]);
  if (expressionCondition == null) return null;
  return expressionCondition ? childrenWhenTrue : childrenWhenFalse;
};
const renderError = jsxExpression => {
  console.warn(`Failed to parse expression <${jsxExpression}>. Rendering fallback...`);
  return null;
};
const JSXElement = _ref4 => {
  let {
    element
  } = _ref4;
  const {
    context,
    dispatch,
    components,
    modules
  } = (0, _context.useTemplateContext)();
  const options = (0, _react.useMemo)(() => ({
    ...context,
    ...modules,
    dispatch
  }), [context, modules]);
  const [jsxExpression] = (0, _react.useState)(element);
  return (0, _react2.jsx)(_reactJsxParser.default, {
    jsx: jsxExpression,
    bindings: options,
    components: components,
    renderInWrapper: false,
    renderError: () => renderError(jsxExpression)
  });
};
const getReactChildClone = (parser, parentProps) => _ref5 => {
  let {
    element
  } = _ref5;
  const [ClonedComponent, setClonedComponent] = (0, _react.useState)();
  const [readyToRender, setReadyToRender] = (0, _react.useState)(false);
  (0, _react.useEffect)(() => {
    const el = parser(element);
    if (el) {
      setClonedComponent(() => function IntermediateClone() {
        return /*#__PURE__*/(0, _react.cloneElement)(el, {
          parentProps
        });
      });
      setReadyToRender(true);
    }
  }, []);
  return readyToRender ? (0, _react2.jsx)(ClonedComponent, null) : null;
};
const getCompoundComponents = (parser, parentProps) => ({
  AnchorComponent: getAnchorComponent(parser),
  BasicElement: getBasicElement(parser),
  ConditionalRenderer: getConditionalRenderer(parser),
  JSXElement,
  ReactChildClone: getReactChildClone(parser, parentProps)
});
const TemplateRenderer = _ref6 => {
  let {
    showLoader = true,
    renderElements,
    parser,
    parserKeys,
    startChildRender = null,
    parentProps
  } = _ref6;
  const [elements, setElements] = (0, _react.useState)(null);
  const [isReadyToRender, setIsReadyToRender] = (0, _react.useState)(false);
  const {
    isReady
  } = (0, _context.useTemplateContext)();
  (0, _react.useEffect)(() => {
    if (isReady && startChildRender !== false) {
      if (elements) {
        setIsReadyToRender(true);
      } else {
        const parsedElements = (0, _parseTemplate.default)(getCompoundComponents(parser, parentProps), parserKeys)(renderElements);
        setElements(parsedElements);
      }
    }
  }, [elements, isReady, startChildRender]);
  const loading = showLoader ? (0, _react2.jsx)(_antd.Spin, {
    tip: "Loading..."
  }) : null;
  return isReadyToRender ? elements : loading;
};
const Template = props => {
  const {
    data,
    component: {
      id,
      params: config
    },
    children = [],
    plugin,
    store
  } = props;
  const isParentProvider = config.isParentProvider || false;
  const location = (0, _reactRouterDom.useLocation)();
  const [expressionIterator, parserKeys] = (0, _react.useMemo)(() => (0, _parseExpression.default)(config.id || id, config, _react.default.Children.toArray(children)), [config]);
  const parser = (0, _react.useCallback)((expression, options) => expressionIterator(options)(expression), [config]);
  const [isReadyToRegister, registerData] = (0, _useRegister.default)(config, plugin, parser,
  // adding location data and query string data here
  {
    ...data.data,
    ...location.state
  }, store);
  const {
    dispatch
  } = (0, _context.useTemplateContext)();
  const [startChildRender, setStartChildRender] = (0, _react.useState)(false);
  (0, _react.useEffect)(() => {
    if (!isParentProvider && isReadyToRegister) {
      dispatch({
        type: 'register',
        ...registerData
      });
      setStartChildRender(true);
    }
  }, [isParentProvider, isReadyToRegister]);
  return isParentProvider ? (0, _react2.jsx)(_context.default, {
    key: `${parserKeys.INSTANCE_ID}-provider`,
    isParentProvider: isParentProvider,
    isReadyToRegister: isReadyToRegister,
    register: registerData
  }, (0, _react2.jsx)(TemplateRenderer, {
    showLoader: config.showLoader,
    renderElements: config.render,
    parser: parser,
    parserKeys: parserKeys,
    parentProps: props
  })) : (0, _react2.jsx)(TemplateRenderer, {
    showLoader: config.showLoader,
    renderElements: config.render,
    parser: parser,
    parserKeys: parserKeys,
    startChildRender: startChildRender
  });
};
var _default = Template;
exports.default = _default;
module.exports = exports.default;