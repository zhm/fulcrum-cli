"use strict";
// @ts-nocheck
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const list_1 = __importDefault(require("./actions/list"));
const find_1 = __importDefault(require("./actions/find"));
const resource_1 = __importDefault(require("./resource"));
class Project extends resource_1.default {
    get resourceName() {
        return 'project';
    }
    get resourcesName() {
        return 'projects';
    }
}
exports.default = Project;
list_1.default.includeInto(Project);
find_1.default.includeInto(Project);
//# sourceMappingURL=project.js.map