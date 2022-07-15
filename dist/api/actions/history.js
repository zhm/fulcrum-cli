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
            params,
        };
        const json = await this.call(options);
        return json[this.resourcesName];
    }
}
exports.default = History;
//# sourceMappingURL=history.js.map