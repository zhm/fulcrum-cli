"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.command = void 0;
const api_1 = require("../shared/api");
const revert_changeset_1 = __importDefault(require("../shared/revert-changeset"));
exports.command = 'revert-changeset';
exports.description = 'Revert a changeset';
const builder = (yargs) => {
    yargs
        .option('changesetId', {
        type: 'string',
        description: 'Changeset ID',
    })
        .strict(false);
};
exports.builder = builder;
const handler = async ({ endpoint, token, changesetId, }) => {
    const client = (0, api_1.createClient)(endpoint, token);
    await (0, revert_changeset_1.default)(client, changesetId);
};
exports.handler = handler;
//# sourceMappingURL=revert-changeset.js.map