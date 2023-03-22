"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReadmeContent = exports.README_EXTENSIONS = exports.README_BASE_NAME = void 0;
exports.README_BASE_NAME = "README";
exports.README_EXTENSIONS = [".md", ".markdown"];
function getReadmeContent(readme) {
    if (readme.trim() === "") {
        return readme;
    }
    try {
        const markdown = require("markdown-it")();
        return markdown.render(readme);
    }
    catch {
        return null;
    }
}
exports.getReadmeContent = getReadmeContent;
//# sourceMappingURL=readme.js.map