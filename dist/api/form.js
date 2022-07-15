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
class Form extends resource_1.default {
    get resourceName() {
        return 'form';
    }
    get resourcesName() {
        return 'forms';
    }
    async systemApps() {
        const options = {
            method: 'GET',
            path: this.collectionAction('system_apps', null),
        };
        const json = await this.call(options);
        return json;
    }
}
exports.default = Form;
list_1.default.includeInto(Form);
find_1.default.includeInto(Form);
create_1.default.includeInto(Form);
update_1.default.includeInto(Form);
delete_1.default.includeInto(Form);
//# sourceMappingURL=form.js.map