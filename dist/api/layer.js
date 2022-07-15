"use strict";
// @ts-nocheck
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const list_1 = __importDefault(require("./actions/list"));
const find_1 = __importDefault(require("./actions/find"));
const resource_1 = __importDefault(require("./resource"));
class Layer extends resource_1.default {
    get resourceName() {
        return 'layer';
    }
    get resourcesName() {
        return 'layers';
    }
}
exports.default = Layer;
list_1.default.includeInto(Layer);
find_1.default.includeInto(Layer);
//# sourceMappingURL=layer.js.map