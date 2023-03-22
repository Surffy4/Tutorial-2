"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCreationModule = exports.newSwing = void 0;
const os = require("os");
const path = require("path");
const vscode = require("vscode");
const config = require("../config");
const constants_1 = require("../constants");
const preview_1 = require("../preview");
const utils_1 = require("../utils");
const galleryProvider_1 = require("./galleryProvider");
async function newSwing(uri, title = "Create new swing") {
    const quickPick = vscode.window.createQuickPick();
    quickPick.title = title;
    quickPick.placeholder = "Select the swing template to use";
    quickPick.matchOnDescription = true;
    const galleries = await galleryProvider_1.loadGalleries();
    const templates = galleries
        .filter((gallery) => gallery.enabled)
        .flatMap((gallery) => gallery.templates)
        .sort((a, b) => a.title.localeCompare(b.title))
        .map((t) => ({ ...t, label: t.title }));
    if (templates.length === 0) {
        templates.push({
            label: "No templates available. Configure your template galleries and try again.",
        });
    }
    quickPick.items = templates;
    quickPick.buttons = [
        {
            iconPath: new vscode.ThemeIcon("settings"),
            tooltip: "Configure Template Galleries",
        },
    ];
    quickPick.onDidTriggerButton((e) => promptForGalleryConfiguration(uri, title));
    quickPick.onDidAccept(async () => {
        quickPick.hide();
        const template = quickPick.selectedItems[0];
        if (template.files) {
            const swingUri = await utils_1.withProgress("Creating swing...", async () => newSwingFromTemplate(template.files, uri));
            preview_1.openSwing(swingUri);
        }
    });
    quickPick.show();
}
exports.newSwing = newSwing;
async function newSwingFromTemplate(files, uri) {
    const manifest = files.find((file) => file.filename === constants_1.SWING_FILE);
    if (!manifest) {
        const content = JSON.stringify(preview_1.DEFAULT_MANIFEST, null, 2);
        files.push({ filename: constants_1.SWING_FILE, content });
    }
    else if (manifest.content) {
        try {
            const content = JSON.parse(manifest.content);
            delete content.template;
            manifest.content = JSON.stringify(content, null, 2);
        }
        catch {
            // If the template included an invalid
            // manifest file, then there's nothing
            // we can really do about it.
        }
    }
    if (uri instanceof Function) {
        return uri(files.map(({ filename, content }) => ({
            filename,
            content: content ? content : "",
        })));
    }
    else {
        await Promise.all(files.map(({ filename, content = "" }) => {
            const targetFileUri = vscode.Uri.joinPath(uri, filename);
            return vscode.workspace.fs.writeFile(targetFileUri, utils_1.stringToByteArray(content));
        }));
        return uri;
    }
}
async function promptForGalleryConfiguration(uri, title) {
    const quickPick = vscode.window.createQuickPick();
    quickPick.title = "Configure template galleries";
    quickPick.placeholder =
        "Select the galleries you'd like to display templates from";
    quickPick.canSelectMany = true;
    const galleries = (await galleryProvider_1.loadGalleries())
        .sort((a, b) => a.title.localeCompare(b.title))
        .map((gallery) => ({ ...gallery, label: gallery.title }));
    quickPick.items = galleries;
    quickPick.selectedItems = galleries.filter((gallery) => gallery.enabled);
    quickPick.buttons = [vscode.QuickInputButtons.Back];
    quickPick.onDidTriggerButton((e) => {
        if (e === vscode.QuickInputButtons.Back) {
            return newSwing(uri, title);
        }
    });
    quickPick.onDidAccept(async () => {
        const galleries = quickPick.selectedItems.map((item) => item.id);
        quickPick.busy = true;
        await galleryProvider_1.enableGalleries(galleries);
        quickPick.busy = false;
        quickPick.hide();
        return newSwing(uri, title);
    });
    quickPick.show();
}
async function registerCreationModule(context, api) {
    context.subscriptions.push(vscode.commands.registerCommand(`${constants_1.EXTENSION_NAME}.newScratchSwing`, async () => {
        const scratchDirectory = config.get("scratchDirectory") ||
            path.join(os.tmpdir(), constants_1.EXTENSION_NAME);
        const dayjs = require("dayjs");
        const timestamp = dayjs().format("YYYY-MM-DD (hh-mm-ss A)");
        const swingDirectory = path.join(scratchDirectory, timestamp);
        const uri = vscode.Uri.file(swingDirectory);
        await vscode.workspace.fs.createDirectory(uri);
        newSwing(uri);
    }));
    context.subscriptions.push(vscode.commands.registerCommand(`${constants_1.EXTENSION_NAME}.newSwing`, async () => {
        var _a;
        const folder = await vscode.window.showOpenDialog({
            canSelectFolders: true,
            canSelectFiles: false,
            canSelectMany: false,
            defaultUri: (_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0].uri,
        });
        if (folder) {
            newSwing(folder[0]);
        }
    }));
    api.newSwing = newSwing;
    api.registerTemplateProvider = galleryProvider_1.registerTemplateProvider;
}
exports.registerCreationModule = registerCreationModule;
//# sourceMappingURL=index.js.map