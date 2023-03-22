"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileComponent = void 0;
const script_1 = require("../script");
function getComponentName(code) {
    const [, component] = code.match(/export\sdefault\s(?:(?:class|function)\s)?(\w+)?/);
    return component;
}
async function compileComponent(content, document) {
    const [code] = (await script_1.getScriptContent(document, undefined));
    const componentName = getComponentName(code);
    const init = `ReactDOM.render(React.createElement(${componentName}), document.getElementById("app"));`;
    return [code, init];
}
exports.compileComponent = compileComponent;
//# sourceMappingURL=react.js.map