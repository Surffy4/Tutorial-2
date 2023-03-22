"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLibraryVersions = exports.getCDNJSLibraries = void 0;
const axios_1 = require("axios");
const LIBRARIES_URL = "https://api.cdnjs.com/libraries";
let libraries;
async function getLibrariesInternal() {
    try {
        const librariesResponse = await axios_1.default.get(`${LIBRARIES_URL}?fields=description`);
        libraries = librariesResponse.data.results;
        return libraries;
    }
    catch (e) {
        throw new Error("Cannot get the libraries.");
    }
}
let currentGetLibrariesPromise;
async function getCDNJSLibraries() {
    if (libraries) {
        return libraries;
    }
    if (currentGetLibrariesPromise) {
        return await currentGetLibrariesPromise;
    }
    currentGetLibrariesPromise = getLibrariesInternal();
    return await currentGetLibrariesPromise;
}
exports.getCDNJSLibraries = getCDNJSLibraries;
async function getLibraryVersions(libraryName) {
    try {
        const libraries = await axios_1.default.get(`${LIBRARIES_URL}/${libraryName}`);
        const packageManifest = libraries.data;
        return [
            {
                version: "latest",
                files: [packageManifest.filename],
            },
            ...packageManifest.assets,
        ];
    }
    catch {
        return [];
    }
}
exports.getLibraryVersions = getLibraryVersions;
//# sourceMappingURL=cdnjs.js.map