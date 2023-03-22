"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeService = void 0;
const vscode_1 = require("vscode");
const constants_1 = require("../constants");
const preview_1 = require("../preview");
const service_1 = require("./service");
async function initializeService(vslsApi) {
    const service = await vslsApi.getSharedService(constants_1.EXTENSION_NAME);
    if (!service)
        return;
    const response = await service.request("getActiveSwing", []);
    if (response) {
        const uri = vscode_1.Uri.parse(response.uri);
        preview_1.openSwing(uri);
    }
    service_1.default(vslsApi, vslsApi.session.peerNumber, service);
}
exports.initializeService = initializeService;
//# sourceMappingURL=guestService.js.map