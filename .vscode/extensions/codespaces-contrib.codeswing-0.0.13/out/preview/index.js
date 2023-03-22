"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPreviewModule = exports.openSwing = exports.getFileOfType = exports.DEFAULT_MANIFEST = void 0;
const debounce_1 = require("debounce");
const path = require("path");
const vscode = require("vscode");
const vscode_1 = require("vscode");
const config = require("../config");
const constants_1 = require("../constants");
const store_1 = require("../store");
const utils_1 = require("../utils");
const codepen_1 = require("./codepen");
const commands_1 = require("./commands");
const languageProvider_1 = require("./languages/languageProvider");
const markup_1 = require("./languages/markup");
const readme_1 = require("./languages/readme");
const script_1 = require("./languages/script");
const stylesheet_1 = require("./languages/stylesheet");
const layoutManager_1 = require("./layoutManager");
const cdnjs_1 = require("./libraries/cdnjs");
const tour_1 = require("./tour");
const tutorials_1 = require("./tutorials");
const storage_1 = require("./tutorials/storage");
const webview_1 = require("./webview");
const CONFIG_FILE = "config.json";
const CANVAS_FILE = "canvas.html";
exports.DEFAULT_MANIFEST = {
    scripts: [],
    styles: [],
};
async function getCanvasContent(uri, files) {
    if (!files.includes(CANVAS_FILE)) {
        return "";
    }
    return await utils_1.getFileContents(uri, CANVAS_FILE);
}
async function getManifestContent(uri, files) {
    const manifest = await utils_1.getFileContents(uri, constants_1.SWING_FILE);
    if (script_1.includesReactFiles(files)) {
        const parsedManifest = JSON.parse(manifest);
        if (!script_1.includesReactScripts(parsedManifest.scripts)) {
            parsedManifest.scripts.push(...script_1.REACT_SCRIPTS);
            parsedManifest.scripts = [...new Set(parsedManifest.scripts)];
            const content = JSON.stringify(parsedManifest, null, 2);
            const manifestUri = getFileOfType(uri, files, store_1.SwingFileType.manifest);
            vscode.workspace.fs.writeFile(manifestUri, utils_1.stringToByteArray(content));
            return content;
        }
    }
    return manifest;
}
function localeCompare(a, b) {
    return a.localeCompare(b, undefined, { sensitivity: "base" }) === 0;
}
function isSwingDocument(files, document, fileType) {
    const swingUri = store_1.store.activeSwing.currentUri;
    if (!localeCompare(swingUri.scheme, document.uri.scheme) ||
        !localeCompare(swingUri.authority, document.uri.authority) ||
        !localeCompare(swingUri.query, document.uri.query) ||
        !document.uri.path.toUpperCase().startsWith(swingUri.path.toUpperCase()) ||
        !files.includes(path.basename(document.uri.path))) {
        return false;
    }
    let extensions;
    let fileBaseName;
    switch (fileType) {
        case store_1.SwingFileType.markup:
            extensions = markup_1.getMarkupExtensions();
            fileBaseName = markup_1.MARKUP_BASE_NAME;
            break;
        case store_1.SwingFileType.script:
            extensions = script_1.SCRIPT_EXTENSIONS;
            fileBaseName = script_1.SCRIPT_BASE_NAME;
            break;
        case store_1.SwingFileType.readme:
            extensions = readme_1.README_EXTENSIONS;
            fileBaseName = readme_1.README_BASE_NAME;
            break;
        case store_1.SwingFileType.manifest:
            extensions = [""];
            fileBaseName = constants_1.SWING_FILE;
            break;
        case store_1.SwingFileType.config:
            extensions = [""];
            fileBaseName = CONFIG_FILE;
            break;
        case store_1.SwingFileType.stylesheet:
        default:
            extensions = stylesheet_1.STYLESHEET_EXTENSIONS;
            fileBaseName = stylesheet_1.STYLESHEET_BASE_NAME;
            break;
    }
    const fileCandidates = extensions.map((extension) => new RegExp(`${fileBaseName}${extension}`));
    return fileCandidates.find((candidate) => candidate.test(document.uri.path));
}
function getFileOfType(uri, files, fileType) {
    let extensions;
    let fileBaseName;
    switch (fileType) {
        case store_1.SwingFileType.markup:
            extensions = markup_1.getMarkupExtensions();
            fileBaseName = markup_1.MARKUP_BASE_NAME;
            break;
        case store_1.SwingFileType.script:
            extensions = script_1.SCRIPT_EXTENSIONS;
            fileBaseName = script_1.SCRIPT_BASE_NAME;
            break;
        case store_1.SwingFileType.readme:
            extensions = readme_1.README_EXTENSIONS;
            fileBaseName = readme_1.README_BASE_NAME;
            break;
        case store_1.SwingFileType.manifest:
            extensions = [""];
            fileBaseName = constants_1.SWING_FILE;
            break;
        case store_1.SwingFileType.tour:
            extensions = [""];
            fileBaseName = tour_1.TOUR_FILE;
            break;
        case store_1.SwingFileType.config:
            extensions = [""];
            fileBaseName = CONFIG_FILE;
            break;
        case store_1.SwingFileType.stylesheet:
        default:
            extensions = stylesheet_1.STYLESHEET_EXTENSIONS;
            fileBaseName = stylesheet_1.STYLESHEET_BASE_NAME;
            break;
    }
    const fileCandidates = extensions.map((extension) => `${fileBaseName}${extension}`);
    const file = files.find((file) => fileCandidates.find((candidate) => candidate === file));
    if (file) {
        return vscode_1.Uri.joinPath(uri, file);
    }
}
exports.getFileOfType = getFileOfType;
const TUTORIAL_STEP_PATTERN = /^#?(?<step>\d+)[^\/]*/;
async function openSwing(uri) {
    var _a;
    let currentUri = uri;
    if (store_1.store.activeSwing) {
        store_1.store.activeSwing.webViewPanel.dispose();
    }
    const isWorkspaceSwing = uri.toString() === ((_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0].uri.toString());
    await vscode.commands.executeCommand("setContext", "codeswing:inSwingWorkspace", isWorkspaceSwing);
    let files = (await vscode.workspace.fs.readDirectory(uri)).map(([file, _]) => file);
    const rootFiles = files;
    let manifest = {};
    if (getFileOfType(uri, files, store_1.SwingFileType.manifest)) {
        try {
            const manifestContent = await getManifestContent(uri, files);
            manifest = JSON.parse(manifestContent);
        }
        catch { }
    }
    let currentTutorialStep;
    let totalTutorialSteps;
    if (manifest.tutorial) {
        currentTutorialStep = storage_1.storage.currentTutorialStep(uri);
        const tutoralSteps = files.filter(([file, _]) => file.match(TUTORIAL_STEP_PATTERN));
        totalTutorialSteps = tutoralSteps.reduce((maxStep, [fileName, _]) => {
            const step = Number(TUTORIAL_STEP_PATTERN.exec(fileName).groups.step);
            if (step > maxStep) {
                return step;
            }
            else {
                return maxStep;
            }
        }, 0);
        const stepDirectory = files.find((file) => file.match(new RegExp(`^#?${currentTutorialStep}`)));
        currentUri = vscode_1.Uri.joinPath(uri, stepDirectory, "/");
        files = (await vscode.workspace.fs.readDirectory(currentUri)).map(([file, _]) => file);
        const stepManifestFile = getFileOfType(currentUri, files, store_1.SwingFileType.manifest);
        if (stepManifestFile) {
            const stepManifest = utils_1.byteArrayToString(await vscode.workspace.fs.readFile(stepManifestFile));
            manifest = {
                ...manifest,
                ...JSON.parse(stepManifest),
            };
        }
    }
    const markupFile = getFileOfType(currentUri, files, store_1.SwingFileType.markup);
    const stylesheetFile = getFileOfType(currentUri, files, store_1.SwingFileType.stylesheet);
    const scriptFile = getFileOfType(currentUri, files, store_1.SwingFileType.script);
    const readmeFile = getFileOfType(currentUri, files, store_1.SwingFileType.readme);
    const configFile = getFileOfType(currentUri, files, store_1.SwingFileType.config);
    const inputFile = manifest.input && manifest.input.fileName
        ? `${constants_1.INPUT_SCHEME}:///${manifest.input.fileName}`
        : "";
    const includedFiles = [
        !!markupFile,
        !!stylesheetFile,
        !!scriptFile,
        !!inputFile,
    ].filter((file) => file).length;
    const layoutManager = await layoutManager_1.createLayoutManager(includedFiles, manifest.layout, isWorkspaceSwing);
    const [htmlDocument, cssDocument, jsDocument] = await Promise.all([markupFile, stylesheetFile, scriptFile].map(async (file) => file && vscode.workspace.openTextDocument(file)));
    const editors = await Promise.all([htmlDocument, cssDocument, jsDocument].map((document) => document && layoutManager.showDocument(document)));
    let inputDocument;
    if (inputFile) {
        // Clear any previous content from the input file.
        await vscode.workspace.fs.writeFile(vscode.Uri.parse(inputFile), utils_1.stringToByteArray(""));
        inputDocument = await vscode.workspace.openTextDocument(vscode.Uri.parse(inputFile));
        const editor = await layoutManager.showDocument(inputDocument, false);
        const prompt = manifest.input.prompt;
        if (prompt) {
            const decoration = vscode.window.createTextEditorDecorationType({
                after: {
                    contentText: prompt,
                    margin: "0 0 0 30px",
                    fontStyle: "italic",
                    color: new vscode.ThemeColor("editorLineNumber.foreground"),
                },
                isWholeLine: true,
            });
            editor === null || editor === void 0 ? void 0 : editor.setDecorations(decoration, [new vscode.Range(0, 0, 0, 1000)]);
        }
        // Continuously save this file so that it doesn't ask
        // the user to save it upon closing
        const interval = setInterval(() => {
            if (inputDocument) {
                inputDocument.save();
            }
            else {
                clearInterval(interval);
            }
        }, 100);
    }
    const webViewPanel = vscode.window.createWebviewPanel(`${constants_1.EXTENSION_NAME}.preview`, "CodeSwing", { viewColumn: layoutManager.previewViewColumn, preserveFocus: true }, {
        enableScripts: true,
        enableCommandUris: true,
        localResourceRoots: [uri, currentUri],
    });
    const output = vscode.window.createOutputChannel("CodeSwing");
    // In order to provide CodePen interop,
    // we'll look for an optional "scripts"
    // file, which includes the list of external
    // scripts that were added to the pen.
    let scripts;
    if (files.includes("scripts")) {
        scripts = await utils_1.getFileContents(currentUri, "scripts");
    }
    let styles;
    if (files.includes("styles")) {
        styles = await utils_1.getFileContents(currentUri, "styles");
    }
    const htmlView = new webview_1.SwingWebView(webViewPanel.webview, output, currentUri, scripts, styles, totalTutorialSteps, manifest.tutorial);
    if (config.get("showConsole") || manifest.showConsole) {
        output.show(false);
    }
    store_1.store.activeSwing = {
        rootUri: uri,
        currentUri,
        webView: htmlView,
        webViewPanel,
        console: output,
        hasTour: false,
        scriptEditor: editors[2] || (script_1.includesReactFiles(files) ? editors[0] : undefined),
    };
    const autoRun = config.get("autoRun");
    const runOnEdit = autoRun === "onEdit";
    function processReadme(rawContent, runOnEdit = false) {
        // @ts-ignore
        if (manifest.readmeBehavior === "inputComment" && inputDocument) {
            if (store_1.store.activeSwing.commentController) {
                store_1.store.activeSwing.commentController.dispose();
            }
            store_1.store.activeSwing.commentController = vscode.comments.createCommentController(constants_1.EXTENSION_NAME, constants_1.EXTENSION_NAME);
            const thread = store_1.store.activeSwing.commentController.createCommentThread(inputDocument.uri, new vscode.Range(0, 0, 0, 0), [
                {
                    author: {
                        name: "CodeSwing",
                        iconPath: vscode.Uri.parse("https://cdn.jsdelivr.net/gh/codespaces-contrib/codeswing@main/images/icon.png"),
                    },
                    body: rawContent,
                    mode: vscode.CommentMode.Preview,
                },
            ]);
            // @ts-ignore
            thread.canReply = false;
            thread.collapsibleState = vscode.CommentThreadCollapsibleState.Expanded;
        }
        else {
            const htmlContent = readme_1.getReadmeContent(rawContent);
            htmlView.updateReadme(htmlContent || "", runOnEdit);
        }
    }
    const documentChangeDisposable = vscode.workspace.onDidChangeTextDocument(debounce_1.debounce(async ({ document }) => {
        if (isSwingDocument(files, document, store_1.SwingFileType.markup)) {
            const content = await markup_1.getMarkupContent(document);
            if (content !== null) {
                htmlView.updateHTML(content, runOnEdit);
            }
        }
        else if (isSwingDocument(files, document, store_1.SwingFileType.script)) {
            // If the user renamed the script file (e.g. from *.js to *.jsx)
            // than we need to update the manifest in case new scripts
            // need to be injected into the webview (e.g. "react").
            if (jsDocument &&
                jsDocument.uri.toString() !== document.uri.toString()) {
                // TODO: Clean up this logic
                const fileName = path.basename(document.uri.toString());
                files.push(fileName);
                files = files.filter((file) => file !== path.basename(jsDocument.uri.toString()));
                htmlView.updateManifest(await getManifestContent(currentUri, files), runOnEdit);
            }
            htmlView.updateJavaScript(document, runOnEdit);
        }
        else if (isSwingDocument(files, document, store_1.SwingFileType.manifest)) {
            htmlView.updateManifest(document.getText(), runOnEdit);
            if (jsDocument) {
                manifest = JSON.parse(document.getText());
                // TODO: Only update the JS if the manifest change
                // actually impacts it (e.g. adding/removing react)
                htmlView.updateJavaScript(jsDocument, runOnEdit);
            }
        }
        else if (isSwingDocument(files, document, store_1.SwingFileType.stylesheet)) {
            const content = await stylesheet_1.getStylesheetContent(document);
            if (content !== null) {
                htmlView.updateCSS(content, runOnEdit);
            }
        }
        else if (isSwingDocument(files, document, store_1.SwingFileType.readme)) {
            const rawContent = document.getText();
            processReadme(rawContent, runOnEdit);
        }
        else if (isSwingDocument(files, document, store_1.SwingFileType.config)) {
            htmlView.updateConfig(document.getText(), runOnEdit);
        }
        else if (document.uri.scheme === constants_1.INPUT_SCHEME) {
            htmlView.updateInput(document.getText(), runOnEdit);
        }
    }, 100));
    let documentSaveDisposeable;
    if (!runOnEdit && autoRun === "onSave") {
        documentSaveDisposeable = vscode.workspace.onDidSaveTextDocument(async (document) => {
            var _a, _b;
            if (document.uri.scheme === store_1.store.activeSwing.currentUri.scheme &&
                document.uri.authority === ((_a = store_1.store.activeSwing) === null || _a === void 0 ? void 0 : _a.currentUri.authority) &&
                document.uri.query === ((_b = store_1.store.activeSwing) === null || _b === void 0 ? void 0 : _b.currentUri.query) &&
                document.uri.path.startsWith(store_1.store.activeSwing.currentUri.path)) {
                await htmlView.rebuildWebview();
            }
        });
    }
    htmlView.updateManifest(manifest ? JSON.stringify(manifest) : "");
    htmlView.updateHTML(!!markupFile
        ? (await markup_1.getMarkupContent(htmlDocument)) || ""
        : await getCanvasContent(uri, rootFiles));
    htmlView.updateCSS(!!stylesheetFile ? (await stylesheet_1.getStylesheetContent(cssDocument)) || "" : "");
    if (jsDocument) {
        htmlView.updateJavaScript(jsDocument);
    }
    if (readmeFile) {
        const rawContent = utils_1.byteArrayToString(await vscode.workspace.fs.readFile(readmeFile));
        processReadme(rawContent);
    }
    if (configFile) {
        const content = utils_1.byteArrayToString(await vscode.workspace.fs.readFile(configFile));
        htmlView.updateConfig(content || "");
    }
    await htmlView.rebuildWebview();
    await vscode.commands.executeCommand("setContext", `${constants_1.EXTENSION_NAME}:inSwing`, true);
    const autoSave = vscode.workspace
        .getConfiguration("files")
        .get("autoSave");
    let autoSaveInterval;
    const canEdit = true;
    if (autoSave !== "afterDelay" && // Don't enable autoSave if the end-user has already configured it
        config.get("autoSave") &&
        canEdit // You can't edit gists you don't own, so it doesn't make sense to attempt to auto-save these files
    ) {
        autoSaveInterval = setInterval(async () => {
            vscode.commands.executeCommand("workbench.action.files.saveAll");
        }, 30000);
    }
    webViewPanel.onDidDispose(() => {
        var _a, _b, _c;
        vscode.commands.executeCommand("workbench.action.closeAllEditors");
        vscode.commands.executeCommand("workbench.action.closePanel");
        output.dispose();
        documentChangeDisposable.dispose();
        documentSaveDisposeable === null || documentSaveDisposeable === void 0 ? void 0 : documentSaveDisposeable.dispose();
        if ((_a = store_1.store.activeSwing) === null || _a === void 0 ? void 0 : _a.hasTour) {
            tour_1.endCurrentTour();
        }
        (_c = (_b = store_1.store.activeSwing) === null || _b === void 0 ? void 0 : _b.commentController) === null || _c === void 0 ? void 0 : _c.dispose();
        store_1.store.activeSwing = undefined;
        if (autoSaveInterval) {
            clearInterval(autoSaveInterval);
        }
        vscode.commands.executeCommand("setContext", `${constants_1.EXTENSION_NAME}:inSwing`, false);
    });
    if (await tour_1.isCodeTourInstalled()) {
        const tourUri = getFileOfType(currentUri, files, store_1.SwingFileType.tour);
        if (tourUri) {
            store_1.store.activeSwing.hasTour = true;
            tour_1.startTourFromUri(tourUri, currentUri);
        }
        vscode.commands.executeCommand("setContext", `${constants_1.EXTENSION_NAME}:codeTourEnabled`, true);
    }
}
exports.openSwing = openSwing;
function registerPreviewModule(context, api) {
    commands_1.registerSwingCommands(context);
    tour_1.registerTourCommands(context);
    codepen_1.registerCodePenCommands(context);
    cdnjs_1.getCDNJSLibraries();
    languageProvider_1.discoverLanguageProviders();
    // @ts-ignore
    context.globalState.setKeysForSync([storage_1.TUTORIAL_KEY]);
    api.openSwing = openSwing;
    api.exportSwingToCodePen = codepen_1.exportSwingToCodePen;
    tutorials_1.registerTutorialModule(context);
}
exports.registerPreviewModule = registerPreviewModule;
//# sourceMappingURL=index.js.map