"use strict";
// @ts-nocheck
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const resource_1 = __importDefault(require("./resource"));
const list_1 = __importDefault(require("./actions/list"));
class WorkflowExecutionResource extends resource_1.default {
    get resourceName() {
        return 'workflow_execution';
    }
    get resourcesName() {
        return 'workflow_executions';
    }
}
exports.default = WorkflowExecutionResource;
list_1.default.includeInto(WorkflowExecutionResource);
//# sourceMappingURL=workflow_execution.js.map