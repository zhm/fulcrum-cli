"use strict";
// @ts-nocheck
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mixmatch_1 = __importDefault(require("mixmatch"));
class Update extends mixmatch_1.default {
    async update(id, object) {
        const options = {
            method: 'PUT',
            path: this.member(id),
            data: this.attributesForObject(object),
        };
        const json = await this.call(options);
        return json[this.resourceName];
    }
}
exports.default = Update;
//# sourceMappingURL=update.js.map