"use strict";
// @ts-nocheck
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const list_1 = __importDefault(require("./actions/list"));
const resource_1 = __importDefault(require("./resource"));
class Permission extends resource_1.default {
    get resourceName() {
        return 'permission';
    }
    get resourcesName() {
        return 'permissions';
    }
    async formMembers(formId) {
        const options = {
            method: 'GET',
            path: `${this.collection()}?type=form_members&object_id=${formId}`,
        };
        const json = await this.call(options);
        return json[this.resourcesName];
    }
}
exports.default = Permission;
list_1.default.includeInto(Permission);
//# sourceMappingURL=permission.js.map