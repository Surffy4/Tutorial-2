"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileComponent = void 0;
const component_compiler_1 = require("@vue/component-compiler");
const APP_INIT = `new Vue({
    el: "#app",
    render: h => h(__vue_component__)
});`;
const COMPONENT_NAME = "index.vue";
const compiler = component_compiler_1.createDefaultCompiler();
function compileComponent(content) {
    const descriptor = compiler.compileToDescriptor(COMPONENT_NAME, content);
    const { code } = component_compiler_1.assemble(compiler, COMPONENT_NAME, descriptor, {});
    return [code, APP_INIT, [["Vue", "vue"]]];
}
exports.compileComponent = compileComponent;
//# sourceMappingURL=vue.js.map