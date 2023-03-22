"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerLiveShareModule = void 0;
const vsls = require("vsls");
const constants_1 = require("../constants");
async function registerLiveShareModule() {
    const vslsApi = await vsls.getApi(`codespace-contrib.${constants_1.EXTENSION_NAME}`);
    if (!vslsApi)
        return;
    vslsApi.onDidChangeSession((e) => {
        if (e.session.id) {
            initializeService(vslsApi);
        }
    });
    if (vslsApi.session.id) {
        initializeService(vslsApi);
    }
}
exports.registerLiveShareModule = registerLiveShareModule;
async function initializeService(vslsApi) {
    let { initializeService } = vslsApi.session.role === vsls.Role.Host
        ? require("./hostService")
        : require("./guestService");
    await initializeService(vslsApi);
}
//# sourceMappingURL=index.js.map