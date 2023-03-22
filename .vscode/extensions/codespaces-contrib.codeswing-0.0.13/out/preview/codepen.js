"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCodePenCommands = exports.exportSwingToCodePen = void 0;
const os = require("os");
const path = require("path");
const vscode = require("vscode");
const _1 = require(".");
const constants_1 = require("../constants");
const store_1 = require("../store");
const utils_1 = require("../utils");
const cdnjs_1 = require("./libraries/cdnjs");
function getExportMarkup(data) {
    const value = JSON.stringify(data)
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
    return `<form action="https://codepen.io/pen/define" method="POST">
<input type="hidden" name="data" value="${value}" />
</form>

<script>

  window.onload = () => {
      document.querySelector("form").submit();
  };

</script>
`;
}
const SCRIPT_PATTERN = /<script src="(?<url>[^"]+)"><\/script>/gi;
const STYLE_PATTERN = /<link href="(?<url>[^"]+)" rel="stylesheet" \/>/gi;
function matchAllUrls(string, regex) {
    let match;
    let results = [];
    while ((match = regex.exec(string)) !== null) {
        if (match.index === regex.lastIndex) {
            regex.lastIndex++;
        }
        results.push(match.groups.url);
    }
    return results;
}
function resolveLibraries(libraries) {
    return Promise.all(libraries.map(async (library) => {
        const isUrl = library.match(constants_1.URI_PATTERN);
        if (isUrl) {
            return library;
        }
        else {
            const libraries = await cdnjs_1.getCDNJSLibraries();
            const libraryEntry = libraries.find((lib) => lib.name === library);
            if (!libraryEntry) {
                return "";
            }
            return libraryEntry.latest;
        }
    }));
}
async function exportSwingToCodePen(uri) {
    await vscode.workspace.saveAll();
    const title = path.basename(uri.path);
    const files = (await vscode.workspace.fs.readDirectory(uri)).map(([file, type]) => file);
    const data = {
        title,
        description: title,
        tags: ["codeswing"],
    };
    const markupFile = _1.getFileOfType(uri, files, store_1.SwingFileType.markup);
    const scriptFile = _1.getFileOfType(uri, files, store_1.SwingFileType.script);
    const stylesheetFile = _1.getFileOfType(uri, files, store_1.SwingFileType.stylesheet);
    if (markupFile) {
        data.html = await utils_1.getUriContents(markupFile);
        data.html_pre_processor = markupFile.path.endsWith(".pug") ? "pug" : "none";
    }
    if (scriptFile) {
        data.js = await utils_1.getUriContents(scriptFile);
        const extension = path.extname(scriptFile.path);
        switch (extension) {
            case ".babel":
            case ".jsx":
                data.js_pre_processor = "babel";
                break;
            case ".ts":
            case ".tsx":
                data.js_pre_processor = "typescript";
                break;
            default:
                data.js_pre_processor = "none";
        }
    }
    if (stylesheetFile) {
        data.css = await utils_1.getUriContents(stylesheetFile);
        switch (path.extname(stylesheetFile.path)) {
            case ".scss":
                data.css_pre_processor = "scss";
                break;
            case ".sass":
                data.css_pre_processor = "sass";
                break;
            case ".less":
                data.css_pre_processor = "less";
                break;
            default:
                data.css_pre_processor = "none";
                break;
        }
    }
    let scripts = [];
    let styles = [];
    if (files.includes("scripts")) {
        const scriptsContent = await utils_1.getFileContents(uri, "scripts");
        scripts = matchAllUrls(scriptsContent, SCRIPT_PATTERN);
    }
    if (files.includes("styles")) {
        const stylesContent = await utils_1.getFileContents(uri, "styles");
        styles = matchAllUrls(stylesContent, STYLE_PATTERN);
    }
    if (files.includes(constants_1.SWING_FILE)) {
        const manifestContent = await utils_1.getFileContents(uri, constants_1.SWING_FILE);
        if (manifestContent) {
            let manifest;
            try {
                manifest = JSON.parse(manifestContent);
            }
            catch (e) {
                throw new Error("The swing's manifest file appears to be invalid. Please check it and try again.");
            }
            if (manifest.scripts && manifest.scripts.length > 0) {
                if (manifest.scripts.find((script) => script === "react") &&
                    data.js_pre_processor === "none") {
                    data.js_pre_processor = "babel";
                }
                scripts = scripts.concat(await resolveLibraries(manifest.scripts));
            }
            if (manifest.styles && manifest.styles.length > 0) {
                styles = styles.concat(await resolveLibraries(manifest.styles));
            }
        }
    }
    if (scripts.length > 0) {
        data.js_external = scripts.join(";");
    }
    if (styles.length > 0) {
        data.css_external = styles.join(";");
    }
    const exportMarkup = getExportMarkup(data);
    const exportUri = vscode.Uri.file(path.join(os.tmpdir(), "codepenexport.html"));
    await vscode.workspace.fs.writeFile(exportUri, utils_1.stringToByteArray(exportMarkup));
    await vscode.env.openExternal(exportUri);
    setTimeout(() => vscode.workspace.fs.delete(exportUri), 2000);
}
exports.exportSwingToCodePen = exportSwingToCodePen;
function registerCodePenCommands(context) {
    context.subscriptions.push(vscode.commands.registerCommand(`${constants_1.EXTENSION_NAME}.exportToCodePen`, () => exportSwingToCodePen(store_1.store.activeSwing.rootUri)));
}
exports.registerCodePenCommands = registerCodePenCommands;
//# sourceMappingURL=codepen.js.map