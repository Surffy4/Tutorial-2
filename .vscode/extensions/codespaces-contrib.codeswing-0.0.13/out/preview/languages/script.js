"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScriptContent = exports.includesReactScripts = exports.includesReactFiles = exports.REACT_SCRIPTS = exports.isReactFile = exports.SCRIPT_EXTENSIONS = exports.REACT_EXTENSIONS = exports.ScriptLanguage = exports.SCRIPT_BASE_NAME = void 0;
const path = require("path");
const skypack_1 = require("../libraries/skypack");
exports.SCRIPT_BASE_NAME = "script";
exports.ScriptLanguage = {
    babel: ".babel",
    javascript: ".js",
    javascriptmodule: ".mjs",
    javascriptreact: ".jsx",
    typescript: ".ts",
    typescriptreact: ".tsx",
};
exports.REACT_EXTENSIONS = [
    exports.ScriptLanguage.babel,
    exports.ScriptLanguage.javascriptreact,
    exports.ScriptLanguage.typescriptreact,
];
const MODULE_EXTENSIONS = [exports.ScriptLanguage.javascriptmodule];
const TYPESCRIPT_EXTENSIONS = [exports.ScriptLanguage.typescript, ...exports.REACT_EXTENSIONS];
exports.SCRIPT_EXTENSIONS = [
    exports.ScriptLanguage.javascript,
    ...MODULE_EXTENSIONS,
    ...TYPESCRIPT_EXTENSIONS,
];
function isReactFile(fileName) {
    return exports.REACT_EXTENSIONS.includes(path.extname(fileName));
}
exports.isReactFile = isReactFile;
exports.REACT_SCRIPTS = ["react", "react-dom"];
function includesReactFiles(files) {
    return files.some(isReactFile);
}
exports.includesReactFiles = includesReactFiles;
function includesReactScripts(scripts) {
    return exports.REACT_SCRIPTS.every((script) => scripts.includes(script));
}
exports.includesReactScripts = includesReactScripts;
function getScriptContent(document, manifest) {
    const extension = path.extname(document.uri.path).toLocaleLowerCase();
    let isModule = MODULE_EXTENSIONS.includes(extension);
    let content = document.getText();
    if (content.trim() === "") {
        return [content, isModule];
    }
    else {
        isModule = isModule || content.trim().startsWith("import ");
    }
    if (isModule) {
        content = skypack_1.processImports(content);
    }
    const includesJsx = manifest && manifest.scripts && manifest.scripts.includes("react");
    if (TYPESCRIPT_EXTENSIONS.includes(extension) || includesJsx) {
        const typescript = require("typescript");
        const compilerOptions = {
            experimentalDecorators: true,
            target: "ES2018",
        };
        if (includesJsx || exports.REACT_EXTENSIONS.includes(extension)) {
            compilerOptions.jsx = typescript.JsxEmit.React;
        }
        try {
            return [typescript.transpile(content, compilerOptions), isModule];
        }
        catch (e) {
            // Something failed when trying to transpile Pug,
            // so don't attempt to return anything
            return null;
        }
    }
    else {
        return [content, isModule];
    }
}
exports.getScriptContent = getScriptContent;
//# sourceMappingURL=script.js.map