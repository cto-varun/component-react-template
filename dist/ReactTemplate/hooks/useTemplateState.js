"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = require("react");
var _get = _interopRequireDefault(require("lodash/get"));
var _context = require("../../context");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const reducer = function (obj, imports, parser, queriesData) {
  let context = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
  let store = arguments.length > 5 ? arguments[5] : undefined;
  return Object.keys(obj).reduce((acc, k) => {
    return {
      ...acc,
      [k]: parser(obj[k], {
        get: _get.default,
        ...(imports?.modules || {}),
        data: queriesData,
        ...acc,
        context,
        store
      })
    };
  }, {});
};
const useTemplateState = (_ref, parser, queriesData, store) => {
  let {
    state = {},
    constants = {}
  } = _ref;
  const [importRuntimeDependency, setImportRuntimeDependency] = (0, _react.useState)({
    runEffect: false,
    imports: {}
  });
  const [readyToDispatch, setReadyToDispatch] = (0, _react.useState)(false);
  const [templateState, setTemplateState] = (0, _react.useState)({});
  const {
    context
  } = (0, _context.useTemplateContext)();
  (0, _react.useEffect)(() => {
    if (importRuntimeDependency.runEffect) {
      const {
        imports
      } = importRuntimeDependency;
      const parsedState = reducer(state, imports, parser, queriesData, context, store);
      const parsedConstants = reducer(constants, imports, parser, queriesData, context, store);
      setTemplateState({
        ...parsedState,
        ...parsedConstants,
        ...queriesData
      });
      setReadyToDispatch(true);
    }
  }, [importRuntimeDependency.runEffect]);
  const processEffect = (0, _react.useCallback)(imports => {
    setImportRuntimeDependency({
      runEffect: true,
      imports
    });
  }, []);
  return {
    readyToDispatch,
    templateState,
    processEffect
  };
};
var _default = useTemplateState;
exports.default = _default;
module.exports = exports.default;