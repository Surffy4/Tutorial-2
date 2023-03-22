"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeService = void 0;
const vscode = require("vscode");
const constants_1 = require("../constants");
const store_1 = require("../store");
const service_1 = require("./service");
// TODO: Replace this with a fixed version of the Live Share API
function convertUri(uri) {
    let workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    const relativePath = (workspaceFolder === null || workspaceFolder === void 0 ? void 0 : workspaceFolder.uri.toString()) === uri.toString()
        ? ""
        : vscode.workspace.asRelativePath(uri, false);
    let rootPrefix = "";
    if (workspaceFolder && workspaceFolder.index > 0) {
        rootPrefix = `~${workspaceFolder.index}/`;
    }
    return vscode.Uri.parse(`vsls:/${rootPrefix}${relativePath}`);
}
async function initializeService(vslsApi) {
    const service = await vslsApi.shareService(constants_1.EXTENSION_NAME);
    if (!service)
        return;
    service.onRequest("getActiveSwing", () => {
        if (!store_1.store.activeSwing) {
            return null;
        }
        const uri = convertUri(store_1.store.activeSwing.rootUri);
        return {
            uri: uri.toString(),
        };
    });
    service_1.default(vslsApi, vslsApi.session.peerNumber, service, true);
}
exports.initializeService = initializeService;
//# sourceMappingURL=hostService.js.map