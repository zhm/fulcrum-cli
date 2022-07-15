"use strict";
// @ts-nocheck
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const list_1 = __importDefault(require("./actions/list"));
const find_1 = __importDefault(require("./actions/find"));
const create_1 = __importDefault(require("./actions/create"));
const update_1 = __importDefault(require("./actions/update"));
const delete_1 = __importDefault(require("./actions/delete"));
const resource_1 = __importDefault(require("./resource"));
class Membership extends resource_1.default {
    get resourceName() {
        return 'membership';
    }
    get resourcesName() {
        return 'memberships';
    }
    async changePermissions(changes) {
        const options = {
            method: 'POST',
            path: this.collectionAction('change_permissions'),
            data: { change: changes },
        };
        const json = await this.call(options);
        return json[this.resourceName];
    }
}
exports.default = Membership;
list_1.default.includeInto(Membership);
find_1.default.includeInto(Membership);
create_1.default.includeInto(Membership);
update_1.default.includeInto(Membership);
delete_1.default.includeInto(Membership);
//# sourceMappingURL=membership.js.map