"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerInputFileSystemProvider = exports.InputFileSystemProvider = void 0;
const path = require("path");
const vscode = require("vscode");
const constants_1 = require("../../constants");
const utils_1 = require("../../utils");
class InputFileSystemProvider {
    constructor() {
        this._emitter = new vscode.EventEmitter();
        this.onDidChangeFile = this
            ._emitter.event;
        this.files = new Map();
    }
    stat(uri) {
        return {
            type: vscode.FileType.File,
            ctime: Date.now(),
            mtime: Date.now(),
            size: 100,
        };
    }
    readFile(uri) {
        const inputName = path.basename(uri.path);
        const input = this.files.get(inputName);
        return utils_1.stringToByteArray(input);
    }
    writeFile(uri, content, options) {
        const inputName = path.basename(uri.path);
        this.files.set(inputName, utils_1.byteArrayToString(content));
    }
    delete(uri) {
        const inputName = path.basename(uri.path);
        this.files.delete(inputName);
    }
    readDirectory(uri) {
        throw vscode.FileSystemError.NoPermissions("Not supported");
    }
    rename(oldUri, newUri, options) {
        throw vscode.FileSystemError.NoPermissions("Not supported");
    }
    createDirectory(uri) {
        throw vscode.FileSystemError.NoPermissions("Not supported");
    }
    watch(_resource) {
        return { dispose: () => { } };
    }
}
exports.InputFileSystemProvider = InputFileSystemProvider;
function registerInputFileSystemProvider() {
    vscode.workspace.registerFileSystemProvider(constants_1.INPUT_SCHEME, new InputFileSystemProvider());
}
exports.registerInputFileSystemProvider = registerInputFileSystemProvider;
//# sourceMappingURL=inputFileSystem.js.map