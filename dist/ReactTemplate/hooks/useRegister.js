"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = require("react");
var _useImports = _interopRequireDefault(require("./useImports"));
var _useTemplateState = _interopRequireDefault(require("./useTemplateState"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const useRegister = function () {
  let config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  let plugin = arguments.length > 1 ? arguments[1] : undefined;
  let parser = arguments.length > 2 ? arguments[2] : undefined;
  let queriesData = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  let store = arguments.length > 4 ? arguments[4] : undefined;
  const [importsAreReady, imports] = (0, _useImports.default)(config, plugin);
  const {
    processEffect,
    readyToDispatch,
    templateState
  } = (0, _useTemplateState.default)(config, parser, queriesData, store);
  const [isReadyToRegister, setIsReadyToRegister] = (0, _react.useState)(false);
  const registerData = (0, _react.useRef)();
  (0, _react.useEffect)(() => {
    if (importsAreReady) {
      processEffect(imports);
    }
  }, [importsAreReady]);
  (0, _react.useEffect)(() => {
    if (readyToDispatch) {
      registerData.current = {
        imports,
        context: templateState
      };
      setIsReadyToRegister(true);
    }
  }, [readyToDispatch]);
  return [isReadyToRegister, registerData.current];
};
var _default = useRegister;
exports.default = _default;
module.exports = exports.default;