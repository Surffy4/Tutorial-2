"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileComponent = void 0;
const svelte = require("svelte/compiler");
const skypack_1 = require("../../../preview/libraries/skypack");
const utils_1 = require("../../../utils");
const COMPONENT_NAME = `CodeSwingComponent`;
const INIT_CODE = `new ${COMPONENT_NAME}({ target: document.getElementById("app") });`;
const SVELTE_PATH = skypack_1.getModuleUrl("svelte");
async function compileComponent(content) {
    const { code } = await svelte.preprocess(content, {
        script: async ({ content, attributes }) => {
            if (attributes.lang !== "ts") {
                return { code: content };
            }
            ;
            const typescript = require("typescript");
            const compiledContent = typescript.transpile(content, { target: "ES2018" });
            return {
                code: compiledContent
            };
        },
        style: async ({ content, attributes }) => {
            if (attributes.lang !== "scss" && attributes.lang !== "sass") {
                return { code: content };
            }
            ;
            const sass = require("sass");
            const compiledContent = utils_1.byteArrayToString(sass.renderSync({
                data: content,
                indentedSyntax: attributes.lang === "sass",
            }).css);
            return {
                code: compiledContent
            };
        }
    });
    const { js } = svelte.compile(code, {
        name: COMPONENT_NAME,
        sveltePath: SVELTE_PATH
    });
    return [js.code, INIT_CODE];
}
exports.compileComponent = compileComponent;
//# sourceMappingURL=svelte.js.map