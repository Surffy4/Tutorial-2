"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTutorialModule = void 0;
const inputFileSystem_1 = require("./inputFileSystem");
const storage_1 = require("./storage");
async function registerTutorialModule(context) {
    inputFileSystem_1.registerInputFileSystemProvider();
    storage_1.initializeStorage(context);
}
exports.registerTutorialModule = registerTutorialModule;
//# sourceMappingURL=index.js.map