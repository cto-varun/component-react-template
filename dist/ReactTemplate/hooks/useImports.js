"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = require("react");
var _utils = require("../utils");
const normalizeImportList = toImport => {
  if ((0, _utils.prim)(toImport) === 'array') return toImport;
  if (['object', 'string'].includes((0, _utils.prim)(toImport))) {
    return [toImport];
  }
  return [];
};

// relative to /src/plugins/pluginRegistry.js
const normalizeImports = toImport => {
  return normalizeImportList(toImport).map((importItem, index) => {
    if ((0, _utils.prim)(importItem) === 'string') {
      return {
        src: importItem,
        name: importItem,
        default: true,
        as: 'component'
      };
    }
    if ((0, _utils.prim)(importItem) === 'object') {
      return {
        name: importItem.name || `import${index}`,
        default: importItem.default || true,
        src: importItem.src,
        as: importItem.as || 'component' // or 'module'
      };
    }

    return null;
  }).filter(i => i);
};
const processImports = (plugin, imports, setImportList) => {
  imports.forEach(async toImport => {
    const {
      name,
      default: isDefault,
      src,
      as
    } = toImport;
    try {
      const invoked = await plugin.invoke('async.loader', src)[0];
      if (invoked.module) {
        setImportList(importList => ({
          ...importList,
          [as]: {
            ...(importList[as] || {}),
            [name]: isDefault ? invoked.module.default : invoked.module
          }
        }));
      } else if (invoked.error) {
        setImportList(importList => ({
          ...importList,
          errors: importList.errors + 1
        }));
      }
    } catch (error) {
      console.error(error);
      setImportList(importList => ({
        ...importList,
        errors: importList.errors + 1
      }));
    }
  });
};
const useImports = (_ref, plugin) => {
  let {
    import: imports
  } = _ref;
  const [importsAreReady, setImportsAreReady] = (0, _react.useState)(false);
  const [importList, setImportList] = (0, _react.useState)({
    errors: 0
  });
  const [pendingImports, setPendingImports] = (0, _react.useState)(-1);
  (0, _react.useEffect)(() => {
    const normalizedImports = normalizeImports(imports);
    const loadImports = async () => {
      await processImports(plugin, normalizedImports, setImportList);
    };
    loadImports();
    setPendingImports(normalizedImports.length);
  }, []);
  (0, _react.useEffect)(() => {
    let objectCount = 0;
    Object.keys(importList).forEach(k => {
      if (k !== 'errors') {
        objectCount += Object.keys(importList[k]).length;
      }
    });
    const totalProcessed = objectCount + (importList.errors || 0);
    if (totalProcessed === pendingImports) {
      setImportsAreReady(true);
    }
  }, [pendingImports, importList]);
  return [importsAreReady, {
    components: importList?.component || {},
    modules: importList?.module || {}
  }];
};
var _default = useImports;
exports.default = _default;
module.exports = exports.default;