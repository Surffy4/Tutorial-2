"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.set = exports.get = void 0;
const vscode_1 = require("vscode");
const constants_1 = require("./constants");
function get(key) {
    const extensionConfig = vscode_1.workspace.getConfiguration(constants_1.EXTENSION_NAME);
    return extensionConfig.get(key);
}
exports.get = get;
async function set(key, value) {
    const extensionConfig = vscode_1.workspace.getConfiguration(constants_1.EXTENSION_NAME);
    return extensionConfig.update(key, value, true);
}
exports.set = set;
//# sourceMappingURL=config.js.map