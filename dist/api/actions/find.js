"use strict";
// @ts-nocheck
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mixmatch_1 = __importDefault(require("mixmatch"));
class Find extends mixmatch_1.default {
    async find(id, params = {}) {
        const options = {
            method: 'GET',
            path: this.member(id),
            qs: params,
        };
        const body = await this.call(options);
        return JSON.parse(body)[this.resourceName];
    }
}
exports.default = Find;
//# sourceMappingURL=find.js.map