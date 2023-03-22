"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMarkupContent = exports.getMarkupExtensions = exports.getCandidateMarkupFilenames = exports.MARKUP_BASE_NAME = void 0;
const path = require("path");
const skypack_1 = require("../libraries/skypack");
const languageProvider_1 = require("./languageProvider");
const script_1 = require("./script");
exports.MARKUP_BASE_NAME = "index";
const MarkupLanguage = {
    html: ".html",
    markdown: ".md",
    pug: ".pug",
    vue: ".vue",
    svelte: ".svelte"
};
const COMPONENT_EXTENSIONS = [
    MarkupLanguage.vue,
    MarkupLanguage.svelte,
    ...script_1.REACT_EXTENSIONS
];
const MARKUP_EXTENSIONS = [
    MarkupLanguage.html,
    MarkupLanguage.markdown,
    MarkupLanguage.pug,
    ...COMPONENT_EXTENSIONS
];
function getCandidateMarkupFilenames() {
    return getMarkupExtensions().map((extension) => `${exports.MARKUP_BASE_NAME}${extension}`);
}
exports.getCandidateMarkupFilenames = getCandidateMarkupFilenames;
function getMarkupExtensions() {
    const customExtensions = languageProvider_1.getExtensions("markup");
    return [...MARKUP_EXTENSIONS, ...customExtensions];
}
exports.getMarkupExtensions = getMarkupExtensions;
const COMPONENT_TYPE = {
    ".jsx": "react",
    ".tsx": "react",
    ".vue": "vue",
    ".svelte": "svelte"
};
async function getMarkupContent(document) {
    const content = document.getText();
    if (content.trim() === "") {
        return content;
    }
    const extension = path.extname(document.uri.path).toLocaleLowerCase();
    try {
        if (COMPONENT_EXTENSIONS.includes(extension)) {
            const componentType = COMPONENT_TYPE[extension];
            const { compileComponent } = require(`./components/${componentType}`);
            const [component, appInit, imports] = await compileComponent(content, document);
            const code = skypack_1.processImports(component);
            return `<div id="app"></div>
<script type="module">
  ${imports && imports.map(([name, lib]) => `import ${name} from "${skypack_1.getModuleUrl(lib)}";\n`)}
  ${code}
  ${appInit}
</script>`;
        }
        switch (extension) {
            case MarkupLanguage.pug:
                const pug = require("pug");
                return pug.render(content);
            case MarkupLanguage.markdown:
                const markdown = require("markdown-it")();
                return markdown.render(content);
            case MarkupLanguage.html:
                return content;
            default:
                return languageProvider_1.compileCode("markup", extension, content);
        }
    }
    catch {
        return null;
    }
}
exports.getMarkupContent = getMarkupContent;
//# sourceMappingURL=markup.js.map