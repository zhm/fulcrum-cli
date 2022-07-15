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
class ReportTemplate extends resource_1.default {
    get resourceName() {
        return 'report_template';
    }
    get resourcesName() {
        return 'report_templates';
    }
}
exports.default = ReportTemplate;
list_1.default.includeInto(ReportTemplate);
find_1.default.includeInto(ReportTemplate);
create_1.default.includeInto(ReportTemplate);
update_1.default.includeInto(ReportTemplate);
delete_1.default.includeInto(ReportTemplate);
//# sourceMappingURL=report-template.js.map