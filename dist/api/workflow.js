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
class Workflow extends resource_1.default {
    get resourceName() {
        return 'workflow';
    }
    get resourcesName() {
        return 'workflows';
    }
}
exports.default = Workflow;
list_1.default.includeInto(Workflow);
find_1.default.includeInto(Workflow);
create_1.default.includeInto(Workflow);
update_1.default.includeInto(Workflow);
delete_1.default.includeInto(Workflow);
//# sourceMappingURL=workflow.js.map