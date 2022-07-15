"use strict";
// @ts-nocheck
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const resource_1 = __importDefault(require("./resource"));
class User extends resource_1.default {
    get resourceName() {
        return 'user';
    }
    get resourcesName() {
        return 'users';
    }
    async find() {
        const json = await this.client.get({ path: this.collection() });
        return json[this.resourceName];
    }
}
exports.default = User;
//# sourceMappingURL=user.js.map