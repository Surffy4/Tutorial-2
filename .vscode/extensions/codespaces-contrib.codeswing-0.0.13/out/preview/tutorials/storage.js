"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeStorage = exports.storage = exports.TUTORIAL_KEY = void 0;
const constants_1 = require("../../constants");
const store_1 = require("../../store");
exports.TUTORIAL_KEY = `${constants_1.EXTENSION_NAME}:tutorials`;
async function initializeStorage(context) {
    exports.storage = {
        currentTutorialStep(uri = store_1.store.activeSwing.rootUri) {
            const tutorials = context.globalState.get(exports.TUTORIAL_KEY, []);
            const tutorial = tutorials.find(([id, _]) => id === uri.toString());
            return tutorial ? tutorial[1] : 1;
        },
        async setCurrentTutorialStep(tutorialStep) {
            const tutorialId = store_1.store.activeSwing.rootUri.toString();
            const tutorials = context.globalState.get(exports.TUTORIAL_KEY, []);
            const tutorial = tutorials.find(([id, _]) => id === tutorialId);
            if (tutorial) {
                tutorial[1] = tutorialStep;
            }
            else {
                tutorials.push([tutorialId, tutorialStep]);
            }
            return context.globalState.update(exports.TUTORIAL_KEY, tutorials);
        },
    };
}
exports.initializeStorage = initializeStorage;
//# sourceMappingURL=storage.js.map