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
const update_1 = __importDefault(require("./actions/update"));
const resource_1 = __importDefault(require("./resource"));
class View extends resource_1.default {
    get resourceName() {
        return 'view';
    }
    get resourcesName() {
        return 'views';
    }
}
exports.default = View;
list_1.default.includeInto(View);
find_1.default.includeInto(View);
create_1.default.includeInto(View);
update_1.default.includeInto(View);
delete_1.default.includeInto(View);
//# sourceMappingURL=view.js.map