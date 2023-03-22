"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const path = require("path");
const constants_1 = require("./constants");
const markup_1 = require("./preview/languages/markup");
exports.api = {
    isSwing(files) {
        return (files.includes(".block") ||
            files.includes(constants_1.SWING_FILE) ||
            files.some((file) => markup_1.getCandidateMarkupFilenames().includes(file)) ||
            files.includes("scripts") ||
            (files.includes("script.js") &&
                files.some((file) => path.extname(file) === ".markdown")));
    },
};
//# sourceMappingURL=api.js.map