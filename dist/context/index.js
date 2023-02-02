"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useTemplateContext = exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var _get = _interopRequireDefault(require("lodash/get"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const DEFAULT_COMPONENT_IMPORTS = {
  Space: _antd.Space,
  Row: _antd.Row,
  Col: _antd.Col,
  Typography: _antd.Typography,
  Button: _antd.Button,
  Alert: _antd.Alert
};
const DEFAULT_MODULE_IMPORTS = {
  notification: _antd.notification,
  get: _get.default
};
const TemplateStateContext = /*#__PURE__*/(0, _react.createContext)();
const TemplateDispatchContext = /*#__PURE__*/(0, _react.createContext)();
const useTemplateState = () => {
  const context = (0, _react.useContext)(TemplateStateContext);
  if (!context) {
    return {};
  }
  return context;
};
const useTemplateDispatch = () => {
  const context = (0, _react.useContext)(TemplateDispatchContext);
  if (!context) {
    return null;
  }
  return context;
};
const noop = () => {};
const useTemplateContext = () => {
  const [state, dispatch] = [useTemplateState(), useTemplateDispatch()];
  return {
    isReady: state.isReady || false,
    context: state?.context || {},
    components: state?.imports?.components || {},
    modules: state?.imports?.modules || {},
    dispatch: dispatch || noop
  };
};
exports.useTemplateContext = useTemplateContext;
const reducer = (state, action) => {
  switch (action.type) {
    case 'register':
      {
        return {
          ...state,
          context: {
            ...state.context,
            ...action.context
          },
          imports: {
            modules: {
              ...(state?.imports?.modules || {}),
              ...action.imports?.modules
            },
            components: {
              ...(state?.imports?.components || {}),
              ...action.imports?.components
            }
          }
        };
      }
    case 'update':
      {
        return {
          ...state,
          context: {
            ...state.context,
            ...action.context
          }
        };
      }
    case 'isReady':
      {
        return {
          ...state,
          isReady: true
        };
      }
    default:
      {
        throw new Error(`Unknown action type: ${action.type}`);
      }
  }
};
const INITIAL_REGISTER = {
  context: {},
  imports: {
    components: {},
    modules: {}
  },
  isReady: false
};
const initialState = function () {
  let register = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : INITIAL_REGISTER;
  return {
    isReady: register.isReady,
    context: {
      ...register.context
    },
    imports: {
      components: {
        ...register.imports.components,
        ...DEFAULT_COMPONENT_IMPORTS
      },
      modules: {
        ...register.imports.modules,
        ...DEFAULT_MODULE_IMPORTS
      }
    }
  };
};
const TemplateProvider = _ref => {
  let {
    children,
    isParentProvider,
    isReadyToRegister,
    register
  } = _ref;
  const [state, dispatch] = (0, _react.useReducer)(reducer, initialState(INITIAL_REGISTER));
  (0, _react.useEffect)(() => {
    if (isReadyToRegister) {
      if (isParentProvider) {
        dispatch({
          type: 'register',
          ...register
        });
      }
      dispatch({
        type: 'isReady'
      });
    }
  }, [isParentProvider, isReadyToRegister]);
  return /*#__PURE__*/_react.default.createElement(TemplateStateContext.Provider, {
    value: state
  }, /*#__PURE__*/_react.default.createElement(TemplateDispatchContext.Provider, {
    value: dispatch
  }, children));
};
var _default = TemplateProvider;
exports.default = _default;