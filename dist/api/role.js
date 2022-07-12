"use strict";
// @ts-nocheck
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const list_1 = __importDefault(require("./actions/list"));
const find_1 = __importDefault(require("./actions/find"));
const resource_1 = __importDefault(require("./resource"));
class Role extends resource_1.default {
    get resourceName() {
        return 'role';
    }
    get resourcesName() {
        return 'roles';
    }
}
exports.default = Role;
list_1.default.includeInto(Role);
find_1.default.includeInto(Role);
//# sourceMappingURL=role.js.map