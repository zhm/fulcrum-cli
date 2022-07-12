"use strict";
// @ts-nocheck
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mixmatch_1 = __importDefault(require("mixmatch"));
const page_1 = __importDefault(require("../page"));
const DEFAULT_PER_PAGE = 1000;
class List extends mixmatch_1.default {
    get defaultListParams() {
        return { per_page: DEFAULT_PER_PAGE };
    }
    async all(params) {
        const options = {
            method: 'GET',
            path: this.collection(),
            qs: params || this.defaultListParams,
        };
        const body = await this.call(options);
        return new page_1.default(JSON.parse(body), this.resourcesName);
    }
}
exports.default = List;
//# sourceMappingURL=list.js.map