"use strict";
// @ts-nocheck
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mixmatch_1 = __importDefault(require("mixmatch"));
class Delete extends mixmatch_1.default {
    async delete(id, object) {
        const options = {
            method: 'DELETE',
            path: this.member(id),
            data: this.attributesForObject(object),
        };
        const json = await this.call(options);
        return json[this.resourceName];
    }
}
exports.default = Delete;
//# sourceMappingURL=delete.js.map