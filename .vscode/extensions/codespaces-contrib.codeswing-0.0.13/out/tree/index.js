"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTreeViewModule = void 0;
const activeSwing_1 = require("./activeSwing");
const commands_1 = require("./commands");
function registerTreeViewModule(context) {
    commands_1.registerTreeViewCommands(context);
    activeSwing_1.registerTreeProvider();
}
exports.registerTreeViewModule = registerTreeViewModule;
//# sourceMappingURL=index.js.map