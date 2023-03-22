"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeSwingDirectoryNode = exports.CodeSwingFileNode = void 0;
const path = require("path");
const vscode_1 = require("vscode");
class CodeSwingFileNode extends vscode_1.TreeItem {
    constructor(swingUri, file) {
        super(path.basename(file), vscode_1.TreeItemCollapsibleState.None);
        this.swingUri = swingUri;
        this.file = file;
        this.iconPath = vscode_1.ThemeIcon.File;
        this.resourceUri = vscode_1.Uri.joinPath(swingUri, file);
        this.contextValue = "swing.file";
        this.command = {
            command: "vscode.open",
            title: "Open File",
            arguments: [this.resourceUri],
        };
    }
}
exports.CodeSwingFileNode = CodeSwingFileNode;
class CodeSwingDirectoryNode extends vscode_1.TreeItem {
    constructor(swingUri, directory) {
        super(path.basename(directory), vscode_1.TreeItemCollapsibleState.Collapsed);
        this.swingUri = swingUri;
        this.directory = directory;
        this.iconPath = vscode_1.ThemeIcon.Folder;
        this.resourceUri = vscode_1.Uri.joinPath(swingUri, directory);
        this.contextValue = "swing.directory";
    }
}
exports.CodeSwingDirectoryNode = CodeSwingDirectoryNode;
//# sourceMappingURL=nodes.js.map