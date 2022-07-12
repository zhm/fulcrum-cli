"use strict";
// @ts-nocheck
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mixmatch_1 = __importDefault(require("mixmatch"));
class Create extends mixmatch_1.default {
    get createAction() {
        return this.collection();
    }
    async create(object) {
        const options = {
            method: 'POST',
            path: this.createAction,
            body: this.attributesForObject(object),
        };
        const body = await this.call(options);
        return JSON.parse(body)[this.resourceName];
    }
}
exports.default = Create;
//# sourceMappingURL=create.js.map