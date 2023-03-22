"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTemplateProvider = exports.enableGalleries = exports.loadGalleries = void 0;
const axios_1 = require("axios");
const vscode = require("vscode");
const config = require("../config");
const constants_1 = require("../constants");
const CONTRIBUTION_NAME = `${constants_1.EXTENSION_NAME}.templateGalleries`;
let loadGalleriesRunning = false;
let loadGalleriesPromise = Promise.resolve([]);
async function loadGalleries() {
    if (loadGalleriesRunning) {
        return loadGalleriesPromise;
    }
    loadGalleriesPromise = new Promise(async (resolve) => {
        loadGalleriesRunning = true;
        const registrations = vscode.extensions.all
            .flatMap((e) => {
            return e.packageJSON.contributes &&
                e.packageJSON.contributes[CONTRIBUTION_NAME]
                ? e.packageJSON.contributes[CONTRIBUTION_NAME]
                : [];
        })
            .concat(Array.from(templateProviders.entries()).map(([name, [provider, options]]) => {
            return {
                id: name,
                title: options.title || name,
                description: options.description,
                provider,
                enabled: true,
            };
        }));
        const settingContributions = await config.get("templateGalleries");
        for (const gallery of settingContributions) {
            const registration = registrations.find((registration) => registration.id === gallery);
            if (registration) {
                registration.enabled = true;
            }
            else if (gallery.startsWith("https://")) {
                registrations.push({
                    id: gallery,
                    url: gallery,
                    enabled: true,
                    description: "",
                });
            }
        }
        for (const registration of registrations) {
            if (!settingContributions.includes(registration.id)) {
                registration.enabled = false;
            }
        }
        const galleries = await Promise.all(registrations.map(async (gallery) => {
            if (gallery.url) {
                const { data } = await axios_1.default.get(gallery.url);
                gallery.title = data.title;
                gallery.description = data.description;
                gallery.templates = data.templates.map((template) => ({
                    ...template,
                    title: `${data.title}: ${template.title}`,
                }));
            }
            else if (gallery.provider) {
                const templates = await gallery.provider.provideTemplates();
                gallery.templates = templates.map((template) => ({
                    ...template,
                    title: `${gallery.title}: ${template.title}`,
                }));
            }
            return gallery;
        }));
        loadGalleriesRunning = false;
        resolve(galleries);
    });
    return loadGalleriesPromise;
}
exports.loadGalleries = loadGalleries;
async function enableGalleries(galleryIds) {
    await config.set("templateGalleries", galleryIds);
    return loadGalleries();
}
exports.enableGalleries = enableGalleries;
const templateProviders = new Map();
function registerTemplateProvider(providerName, provider, options) {
    templateProviders.set(providerName, [provider, options]);
    provider.onDidChangeTemplates(loadGalleries);
    loadGalleries();
}
exports.registerTemplateProvider = registerTemplateProvider;
vscode.extensions.onDidChange(loadGalleries);
vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration(CONTRIBUTION_NAME)) {
        loadGalleries();
    }
});
loadGalleries();
//# sourceMappingURL=galleryProvider.js.map