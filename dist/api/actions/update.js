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
            body: this.attributesForObject(object),
        };
        const body = await this.call(options);
        return JSON.parse(body)[this.resourceName];
    }
}
exports.default = Update;
//# sourceMappingURL=update.js.map