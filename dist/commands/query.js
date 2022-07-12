"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.command = void 0;
const request_1 = __importDefault(require("request"));
const client_1 = __importDefault(require("../api/client"));
exports.command = 'query';
exports.description = 'Test';
const builder = (yargs) => {
    yargs
        .option('sql', {
        required: true,
        alias: 'sql',
        type: 'string',
        description: 'SQL query',
    })
        .strict(false);
};
exports.builder = builder;
const createClient = (endpoint, token) => {
    const client = new client_1.default({
        base: `${endpoint}/api/v2`,
        config: {
            query_url: endpoint,
        },
        token,
        request: request_1.default,
        userAgent: 'Fulcrum CLI',
    });
    return client;
};
const handler = async ({ endpoint, token, sql }) => {
    const client = createClient(endpoint, token);
    const results = await client.query.run({ q: sql });
    console.log(JSON.stringify(results.objects));
};
exports.handler = handler;
//# sourceMappingURL=query.js.map