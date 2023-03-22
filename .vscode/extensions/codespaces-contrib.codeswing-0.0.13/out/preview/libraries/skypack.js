"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addSkypackModule = exports.getModuleUrl = exports.processImports = void 0;
const axios_1 = require("axios");
const vscode = require("vscode");
const store_1 = require("../../store");
const debounce = require("debounce");
async function getModules(searchString) {
    const librariesResponse = await axios_1.default.get(`https://api.skypack.dev/v1/autocomplete_package?q=${searchString}`);
    return librariesResponse.data.results;
}
async function hasDefaultExport(moduleName) {
    var _a, _b;
    const moduleUrl = getModuleUrl(moduleName);
    const { data } = await axios_1.default.get(`${moduleUrl}?meta`);
    return ((_b = (_a = data.packageExports) === null || _a === void 0 ? void 0 : _a["."]) === null || _b === void 0 ? void 0 : _b.hasDefaultExport) || false;
}
const IMPORT_PATTERN = /(import\s.+\sfrom\s)(["'])(?!\.\/|http)(.+)\2/gi;
const IMPORT_SUBSTITION = `$1$2https://cdn.skypack.dev/$3$2`;
function processImports(code) {
    return code.replace(IMPORT_PATTERN, IMPORT_SUBSTITION);
}
exports.processImports = processImports;
const DEFAULT_MODULES = [
    ["angular", "HTML enhanced for web apps"],
    ["react", "React is a JavaScript library for building user interfaces."],
    ["react-dom", "React package for working with the DOM."],
    ["vue", "Reactive, component-oriented view layer for modern web interfaces."],
];
async function addModuleImport(moduleName, moduleUrl) {
    var _a;
    const { camel } = require("case");
    const importName = camel(moduleName);
    const prefix = (await hasDefaultExport(moduleName)) ? "" : "* as ";
    const importContent = `import ${prefix}${importName} from "${moduleUrl}";\n`;
    (_a = store_1.store.activeSwing.scriptEditor) === null || _a === void 0 ? void 0 : _a.edit((edit) => {
        edit.insert(new vscode.Position(0, 0), importContent);
    });
}
function getModuleUrl(moduleName) {
    return `https://cdn.skypack.dev/${moduleName}`;
}
exports.getModuleUrl = getModuleUrl;
async function addSkypackModule() {
    const list = vscode.window.createQuickPick();
    list.placeholder = "Specify the module name you'd like to add";
    list.items = DEFAULT_MODULES.map(([label, description]) => ({
        label,
        description,
    }));
    list.onDidChangeValue(debounce(async (value) => {
        if (value === "") {
            list.items = DEFAULT_MODULES.map(([label, description]) => ({
                label,
                description,
            }));
        }
        else {
            list.busy = true;
            list.items = [{ label: `Searching modules for "${value}"...` }];
            const modules = await getModules(value);
            list.items = modules.map((module) => ({
                label: module.name,
                description: module.description,
            }));
            list.busy = false;
        }
    }, 100, true));
    list.onDidAccept(async () => {
        list.hide();
        const moduleAnswer = list.selectedItems[0];
        if (!moduleAnswer) {
            return;
        }
        const moduleName = moduleAnswer.label;
        const moduleUrl = getModuleUrl(moduleName);
        await addModuleImport(moduleName, moduleUrl);
    });
    list.show();
}
exports.addSkypackModule = addSkypackModule;
//# sourceMappingURL=skypack.js.map