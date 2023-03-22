"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTreeProvider = exports.refreshTreeView = void 0;
const mobx_1 = require("mobx");
const vscode_1 = require("vscode");
const constants_1 = require("../constants");
const store_1 = require("../store");
const nodes_1 = require("./nodes");
async function getSwingFiles(subDirectory) {
    const swingUri = store_1.store.activeSwing.rootUri;
    const directory = subDirectory ? `${subDirectory}/` : "";
    const files = await vscode_1.workspace.fs.readDirectory(vscode_1.Uri.joinPath(swingUri, directory));
    return files
        .sort(([_, typeA], [__, typeB]) => typeB - typeA)
        .map(([file, fileType]) => {
        const filePath = `${directory}${file}`;
        return fileType === vscode_1.FileType.Directory
            ? new nodes_1.CodeSwingDirectoryNode(swingUri, filePath)
            : new nodes_1.CodeSwingFileNode(swingUri, filePath);
    });
}
class ActiveSwingTreeProvider {
    constructor() {
        this._disposables = [];
        this._onDidChangeTreeData = new vscode_1.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData
            .event;
        this.getTreeItem = (node) => node;
        mobx_1.reaction(() => [store_1.store.activeSwing], this.refreshTree.bind(this));
    }
    getChildren(element) {
        if (!element) {
            if (!store_1.store.activeSwing) {
                return undefined;
            }
            return getSwingFiles();
        }
        else if (element instanceof nodes_1.CodeSwingDirectoryNode) {
            return getSwingFiles(element.directory);
        }
    }
    dispose() {
        this._disposables.forEach((disposable) => disposable.dispose());
    }
    refreshTree() {
        this._onDidChangeTreeData.fire();
    }
}
let treeDataProvider;
function refreshTreeView() {
    treeDataProvider.refreshTree();
}
exports.refreshTreeView = refreshTreeView;
function registerTreeProvider() {
    treeDataProvider = new ActiveSwingTreeProvider();
    vscode_1.window.createTreeView(`${constants_1.EXTENSION_NAME}.activeSwing`, {
        showCollapseAll: true,
        treeDataProvider,
        canSelectMany: true,
    });
}
exports.registerTreeProvider = registerTreeProvider;
//# sourceMappingURL=activeSwing.js.map