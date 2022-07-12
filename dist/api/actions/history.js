"use strict";
// @ts-nocheck
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mixmatch_1 = __importDefault(require("mixmatch"));
class History extends mixmatch_1.default {
    async history(id, params = {}) {
        const options = {
            method: 'GET',
            path: this.memberAction(id, 'history'),
            qs: params,
        };
        const body = await this.call(options);
        return JSON.parse(body)[this.resourcesName];
    }
}
exports.default = History;
//# sourceMappingURL=history.js.map