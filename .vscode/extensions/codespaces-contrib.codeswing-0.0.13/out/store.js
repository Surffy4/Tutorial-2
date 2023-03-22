"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.store = exports.SwingFileType = exports.SwingLibraryType = void 0;
const mobx_1 = require("mobx");
var SwingLibraryType;
(function (SwingLibraryType) {
    SwingLibraryType["script"] = "scripts";
    SwingLibraryType["style"] = "styles";
})(SwingLibraryType = exports.SwingLibraryType || (exports.SwingLibraryType = {}));
var SwingFileType;
(function (SwingFileType) {
    SwingFileType[SwingFileType["config"] = 0] = "config";
    SwingFileType[SwingFileType["markup"] = 1] = "markup";
    SwingFileType[SwingFileType["script"] = 2] = "script";
    SwingFileType[SwingFileType["stylesheet"] = 3] = "stylesheet";
    SwingFileType[SwingFileType["manifest"] = 4] = "manifest";
    SwingFileType[SwingFileType["readme"] = 5] = "readme";
    SwingFileType[SwingFileType["tour"] = 6] = "tour";
})(SwingFileType = exports.SwingFileType || (exports.SwingFileType = {}));
exports.store = mobx_1.observable({});
//# sourceMappingURL=store.js.map