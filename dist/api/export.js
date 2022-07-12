"use strict";
// @ts-nocheck
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const list_1 = __importDefault(require("./actions/list"));
const find_1 = __importDefault(require("./actions/find"));
const create_1 = __importDefault(require("./actions/create"));
const delete_1 = __importDefault(require("./actions/delete"));
const resource_1 = __importDefault(require("./resource"));
class Export extends resource_1.default {
    get resourceName() {
        return 'export';
    }
    get resourcesName() {
        return 'exports';
    }
}
exports.default = Export;
list_1.default.includeInto(Export);
find_1.default.includeInto(Export);
create_1.default.includeInto(Export);
delete_1.default.includeInto(Export);
//# sourceMappingURL=export.js.map