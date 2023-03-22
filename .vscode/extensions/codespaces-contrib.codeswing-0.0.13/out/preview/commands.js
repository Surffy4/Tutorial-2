"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSwingCommands = void 0;
const vscode = require("vscode");
const _1 = require(".");
const config = require("../config");
const constants_1 = require("../constants");
const store_1 = require("../store");
const layoutManager_1 = require("./layoutManager");
const libraries_1 = require("./libraries");
const skypack_1 = require("./libraries/skypack");
async function registerSwingCommands(context) {
    context.subscriptions.push(vscode.commands.registerCommand(`${constants_1.EXTENSION_NAME}.addLibrary`, async () => {
        var _a;
        const items = [
            {
                label: "Script",
                description: "Adds a <script> reference, before your swing script",
                libraryType: store_1.SwingLibraryType.script,
            },
            {
                label: "Stylesheet",
                description: "Adds a <link rel='stylesheet' /> reference, before your swing styles",
                libraryType: store_1.SwingLibraryType.style,
            },
        ];
        if ((_a = store_1.store.activeSwing) === null || _a === void 0 ? void 0 : _a.scriptEditor) {
            items.unshift({
                label: "Script module",
                description: "Adds a import statement to the top of your swing script",
                // @ts-ignore
                libraryType: "module",
            });
        }
        const response = await vscode.window.showQuickPick(items, {
            placeHolder: "Select the library type you'd like to add",
        });
        if (response) {
            if (response.libraryType === store_1.SwingLibraryType.script ||
                response.libraryType === store_1.SwingLibraryType.style) {
                libraries_1.addSwingLibrary(response.libraryType);
            }
            else {
                skypack_1.addSkypackModule();
            }
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand(`${constants_1.EXTENSION_NAME}.openConsole`, () => { var _a; return (_a = store_1.store.activeSwing) === null || _a === void 0 ? void 0 : _a.console.show(); }));
    context.subscriptions.push(vscode.commands.registerCommand(`${constants_1.EXTENSION_NAME}.openDeveloperTools`, () => {
        vscode.commands.executeCommand("workbench.action.webview.openDeveloperTools");
    }));
    context.subscriptions.push(vscode.commands.registerCommand(`${constants_1.EXTENSION_NAME}.run`, async () => { var _a; return (_a = store_1.store.activeSwing) === null || _a === void 0 ? void 0 : _a.webView.rebuildWebview(); }));
    context.subscriptions.push(vscode.commands.registerCommand(`${constants_1.EXTENSION_NAME}.changeLayout`, async () => {
        const { capital } = require("case");
        const items = Object.keys(layoutManager_1.SwingLayout).map((layout) => {
            return { label: capital(layout), layout };
        });
        const result = await vscode.window.showQuickPick(items, {
            placeHolder: "Select the layout to use for swings",
        });
        if (result) {
            await config.set("layout", result.layout);
            _1.openSwing(store_1.store.activeSwing.rootUri);
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand(`${constants_1.EXTENSION_NAME}.openSwing`, async () => {
        const folder = await vscode.window.showOpenDialog({
            canSelectFolders: true,
            canSelectFiles: false,
            canSelectMany: false,
        });
        if (folder) {
            _1.openSwing(folder[0]);
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand(`${constants_1.EXTENSION_NAME}.openWorkspaceSwing`, () => {
        _1.openSwing(vscode.workspace.workspaceFolders[0].uri);
    }));
}
exports.registerSwingCommands = registerSwingCommands;
//# sourceMappingURL=commands.js.map