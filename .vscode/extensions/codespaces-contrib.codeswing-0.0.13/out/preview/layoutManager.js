"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLayoutManager = exports.SwingLayout = void 0;
const vscode_1 = require("vscode");
const config = require("../config");
var EditorLayoutOrientation;
(function (EditorLayoutOrientation) {
    EditorLayoutOrientation[EditorLayoutOrientation["horizontal"] = 0] = "horizontal";
    EditorLayoutOrientation[EditorLayoutOrientation["vertical"] = 1] = "vertical";
})(EditorLayoutOrientation || (EditorLayoutOrientation = {}));
const EditorLayouts = {
    splitOne: {
        orientation: EditorLayoutOrientation.horizontal,
        groups: [{}, {}],
    },
    splitTwo: {
        orientation: EditorLayoutOrientation.horizontal,
        groups: [
            {
                orientation: EditorLayoutOrientation.vertical,
                groups: [{}, {}],
                size: 0.5,
            },
            { groups: [{}], size: 0.5 },
        ],
    },
    splitThree: {
        orientation: EditorLayoutOrientation.horizontal,
        groups: [
            {
                orientation: EditorLayoutOrientation.vertical,
                groups: [{}, {}, {}],
                size: 0.5,
            },
            { groups: [{}], size: 0.5 },
        ],
    },
    grid: {
        orientation: EditorLayoutOrientation.horizontal,
        groups: [
            {
                orientation: EditorLayoutOrientation.vertical,
                groups: [{}, {}],
                size: 0.5,
            },
            {
                orientation: EditorLayoutOrientation.vertical,
                groups: [{}, {}],
                size: 0.5,
            },
        ],
    },
};
var SwingLayout;
(function (SwingLayout) {
    SwingLayout["grid"] = "grid";
    SwingLayout["preview"] = "preview";
    SwingLayout["splitBottom"] = "splitBottom";
    SwingLayout["splitLeft"] = "splitLeft";
    SwingLayout["splitLeftTabbed"] = "splitLeftTabbed";
    SwingLayout["splitRight"] = "splitRight";
    SwingLayout["splitRightTabbed"] = "splitRightTabbed";
    SwingLayout["splitTop"] = "splitTop";
})(SwingLayout = exports.SwingLayout || (exports.SwingLayout = {}));
async function createLayoutManager(includedFiles, layout, isWorkspaceSwing = false) {
    if (!layout) {
        layout = await config.get("layout");
    }
    let currentViewColumn = vscode_1.ViewColumn.One;
    let previewViewColumn = includedFiles + 1;
    let editorLayout;
    if (includedFiles === 3) {
        editorLayout =
            layout === SwingLayout.grid
                ? EditorLayouts.grid
                : EditorLayouts.splitThree;
    }
    else if (includedFiles === 2) {
        editorLayout = EditorLayouts.splitTwo;
    }
    else {
        editorLayout = EditorLayouts.splitOne;
    }
    if (layout === SwingLayout.splitRight) {
        editorLayout = {
            ...editorLayout,
            groups: [...editorLayout.groups].reverse(),
        };
        currentViewColumn = vscode_1.ViewColumn.Two;
        previewViewColumn = vscode_1.ViewColumn.One;
    }
    else if (layout === SwingLayout.splitTop) {
        editorLayout = {
            ...editorLayout,
            orientation: EditorLayoutOrientation.vertical,
        };
    }
    else if (layout === SwingLayout.splitBottom) {
        editorLayout = {
            orientation: EditorLayoutOrientation.vertical,
            groups: [...editorLayout.groups].reverse(),
        };
        currentViewColumn = vscode_1.ViewColumn.Two;
        previewViewColumn = vscode_1.ViewColumn.One;
    }
    else if (layout === SwingLayout.splitLeftTabbed) {
        editorLayout = EditorLayouts.splitOne;
        previewViewColumn = vscode_1.ViewColumn.Two;
    }
    else if (layout === SwingLayout.splitRightTabbed) {
        editorLayout = EditorLayouts.splitOne;
        currentViewColumn = vscode_1.ViewColumn.Two;
        previewViewColumn = vscode_1.ViewColumn.One;
    }
    await vscode_1.commands.executeCommand("workbench.action.closeAllEditors");
    await vscode_1.commands.executeCommand("workbench.action.closePanel");
    if (isWorkspaceSwing) {
        await vscode_1.commands.executeCommand("workbench.action.closeSidebar");
    }
    // The preview layout mode only shows a single file,
    // so there's no need to set a custom editor layout for it.
    if (includedFiles > 0 && layout !== SwingLayout.preview) {
        await vscode_1.commands.executeCommand("vscode.setEditorLayout", editorLayout);
    }
    return {
        previewViewColumn,
        showDocument: async function (document, preserveFocus = true) {
            if (layout === SwingLayout.preview) {
                return;
            }
            const editor = vscode_1.window.showTextDocument(document, {
                preview: false,
                viewColumn: currentViewColumn,
                preserveFocus,
            });
            if (layout !== SwingLayout.splitLeftTabbed &&
                layout !== SwingLayout.splitRightTabbed) {
                currentViewColumn++;
            }
            return editor;
        },
    };
}
exports.createLayoutManager = createLayoutManager;
//# sourceMappingURL=layoutManager.js.map