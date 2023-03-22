"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerProxyFileSystemProvider = exports.ProxyFileSystemProvider = void 0;
const vscode = require("vscode");
const FS_SCHEME = "codeswing-proxy";
class ProxyFileSystemProvider {
    constructor() {
        this._emitter = new vscode.EventEmitter();
        this.onDidChangeFile = this
            ._emitter.event;
    }
    stat(uri) {
        return {
            type: vscode.FileType.File,
            ctime: 0,
            mtime: 0,
            size: 100000,
        };
    }
    async readFile(uri) {
        const proxyUri = vscode.Uri.parse(decodeURIComponent(uri.path.substr(1)));
        const file = await vscode.workspace.fs.readFile(proxyUri);
        return Buffer.from(file.buffer);
    }
    static getProxyUri(uri) {
        return vscode.Uri.parse(`${FS_SCHEME}:/${encodeURIComponent(uri.toString())}`);
    }
    writeFile(uri, content, options) {
        throw vscode.FileSystemError.NoPermissions("Not supported");
    }
    delete(uri) {
        throw vscode.FileSystemError.NoPermissions("Not supported");
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
        throw vscode.FileSystemError.NoPermissions("Not supported");
    }
}
exports.ProxyFileSystemProvider = ProxyFileSystemProvider;
function registerProxyFileSystemProvider() {
    vscode.workspace.registerFileSystemProvider(FS_SCHEME, new ProxyFileSystemProvider());
}
exports.registerProxyFileSystemProvider = registerProxyFileSystemProvider;
//# sourceMappingURL=proxyFileSystemProvider.js.map