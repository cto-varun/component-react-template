"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _ReactTemplate = _interopRequireDefault(require("./ReactTemplate"));
var _context = require("./context");
var _reactTemplate = require("./reactTemplate.schema");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var _default = {
  component: _ReactTemplate.default,
  schema: _reactTemplate.schema,
  ui: _reactTemplate.ui,
  useTemplateContext: _context.useTemplateContext
};
exports.default = _default;
module.exports = exports.default;