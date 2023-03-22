"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStylesheetContent = exports.STYLESHEET_EXTENSIONS = exports.STYLESHEET_BASE_NAME = void 0;
const path = require("path");
const store_1 = require("../../store");
const utils_1 = require("../../utils");
exports.STYLESHEET_BASE_NAME = "style";
const StylesheetLanguage = {
    css: ".css",
    less: ".less",
    sass: ".sass",
    scss: ".scss",
};
exports.STYLESHEET_EXTENSIONS = [
    StylesheetLanguage.css,
    StylesheetLanguage.less,
    StylesheetLanguage.sass,
    StylesheetLanguage.scss,
];
async function getStylesheetContent(document) {
    const content = document.getText();
    if (content.trim() === "") {
        return content;
    }
    const extension = path.extname(document.uri.path).toLocaleLowerCase();
    try {
        switch (extension) {
            case StylesheetLanguage.scss:
            case StylesheetLanguage.sass: {
                const sass = require("sass");
                const { css } = sass.renderSync({
                    data: content,
                    indentedSyntax: extension === StylesheetLanguage.sass,
                    includePaths: [store_1.store.activeSwing.currentUri.path]
                });
                return utils_1.byteArrayToString(css);
            }
            case StylesheetLanguage.less: {
                const less = require("less").default;
                const output = await less.render(content);
                return output.css;
            }
            default:
                return content;
        }
    }
    catch {
        return null;
    }
}
exports.getStylesheetContent = getStylesheetContent;
//# sourceMappingURL=stylesheet.js.map