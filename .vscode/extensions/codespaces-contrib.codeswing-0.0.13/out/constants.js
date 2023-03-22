"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.URI_PATTERN = exports.SWING_FILE = exports.INPUT_SCHEME = exports.EXTENSION_ID = exports.EXTENSION_NAME = void 0;
exports.EXTENSION_NAME = "codeswing";
exports.EXTENSION_ID = `codespaces-contrib.${exports.EXTENSION_NAME}`;
exports.INPUT_SCHEME = `${exports.EXTENSION_NAME}-input`;
exports.SWING_FILE = `${exports.EXTENSION_NAME}.json`;
exports.URI_PATTERN = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
//# sourceMappingURL=constants.js.map