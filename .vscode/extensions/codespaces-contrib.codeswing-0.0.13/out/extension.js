"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const api_1 = require("./api");
const creation_1 = require("./creation");
const liveShare_1 = require("./liveShare");
const preview_1 = require("./preview");
const tree_1 = require("./tree");
const utils_1 = require("./utils");
async function activate(context) {
    creation_1.registerCreationModule(context, api_1.api);
    preview_1.registerPreviewModule(context, api_1.api);
    tree_1.registerTreeViewModule(context);
    liveShare_1.registerLiveShareModule();
    utils_1.checkForSwingWorkspace();
    return api_1.api;
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map