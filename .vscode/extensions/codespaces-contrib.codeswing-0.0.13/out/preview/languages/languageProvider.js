"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.discoverLanguageProviders = exports.compileCode = exports.getExtensions = void 0;
const vscode = require("vscode");
const constants_1 = require("../../constants");
const CONTRIBUTION_NAME = `${constants_1.EXTENSION_NAME}.languages`;
const languages = new Map();
function getExtensions(type) {
    const languageDefinitions = languages.get(type);
    if (!languageDefinitions) {
        return [];
    }
    return Array.from(languageDefinitions.keys());
}
exports.getExtensions = getExtensions;
async function compileCode(type, extension, code) {
    var _a;
    const extensionId = (_a = languages.get(type)) === null || _a === void 0 ? void 0 : _a.get(extension);
    if (!extensionId) {
        return null;
    }
    const compiler = await getExtension(extensionId);
    return compiler ? compiler(extension, code) : null;
}
exports.compileCode = compileCode;
async function getExtension(id) {
    var _a;
    const extensionInstance = vscode.extensions.getExtension(id);
    if (!extensionInstance) {
        return;
    }
    if (!extensionInstance.isActive) {
        await extensionInstance.activate();
    }
    return (_a = extensionInstance.exports) === null || _a === void 0 ? void 0 : _a.codeSwingCompile;
}
function discoverLanguageProviders() {
    const languageDefinitions = vscode.extensions.all.flatMap((e) => e.packageJSON.contributes && e.packageJSON.contributes[CONTRIBUTION_NAME]
        ? e.packageJSON.contributes[CONTRIBUTION_NAME].map((language) => ({
            source: e.id,
            ...language,
        }))
        : []);
    languageDefinitions.forEach((language) => {
        if (!languages.has(language.type)) {
            languages.set(language.type, new Map());
        }
        language.extensions.forEach((extension) => {
            languages.get(language.type).set(extension, language.source);
        });
    });
}
exports.discoverLanguageProviders = discoverLanguageProviders;
vscode.extensions.onDidChange(discoverLanguageProviders);
//# sourceMappingURL=languageProvider.js.map