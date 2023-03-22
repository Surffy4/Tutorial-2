"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTourCommands = exports.endCurrentTour = exports.startTourFromUri = exports.startTour = exports.isCodeTourInstalled = exports.TOUR_FILE = void 0;
const vscode = require("vscode");
const vscode_1 = require("vscode");
const constants_1 = require("../constants");
const store_1 = require("../store");
const utils_1 = require("../utils");
exports.TOUR_FILE = "main.tour";
let codeTourApi;
async function ensureApi() {
    if (!codeTourApi) {
        const codeTour = vscode.extensions.getExtension("vsls-contrib.codetour");
        if (!codeTour) {
            return;
        }
        if (!codeTour.isActive) {
            await codeTour.activate();
        }
        codeTourApi = codeTour.exports;
    }
}
async function isCodeTourInstalled() {
    await ensureApi();
    return !!codeTourApi;
}
exports.isCodeTourInstalled = isCodeTourInstalled;
async function startTour(tour, workspaceRoot, startInEditMode = false) {
    tour.id = vscode_1.Uri.joinPath(workspaceRoot, exports.TOUR_FILE).toString();
    codeTourApi.startTour(tour, 0, workspaceRoot, startInEditMode);
}
exports.startTour = startTour;
async function startTourFromUri(tourUri, workspaceRoot) {
    try {
        const contents = await vscode.workspace.fs.readFile(tourUri);
        const tour = JSON.parse(utils_1.byteArrayToString(contents));
        startTour(tour, workspaceRoot);
    }
    catch { }
}
exports.startTourFromUri = startTourFromUri;
async function endCurrentTour() {
    codeTourApi.endCurrentTour();
}
exports.endCurrentTour = endCurrentTour;
async function registerTourCommands(context) {
    context.subscriptions.push(vscode.commands.registerCommand(`${constants_1.EXTENSION_NAME}.recordCodeTour`, async () => utils_1.withProgress("Starting tour recorder...", async () => {
        const { rootUri: uri } = store_1.store.activeSwing;
        const tour = {
            title: "CodeSwing",
            steps: [],
        };
        const tourUri = vscode.Uri.joinPath(uri, exports.TOUR_FILE);
        const tourContent = JSON.stringify(tour, null, 2);
        await vscode.workspace.fs.writeFile(tourUri, utils_1.stringToByteArray(tourContent));
        startTour(tour, uri, true);
        store_1.store.activeSwing.hasTour = true;
    })));
}
exports.registerTourCommands = registerTourCommands;
//# sourceMappingURL=tour.js.map