"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.command = void 0;
const api_1 = require("../shared/api");
exports.command = 'query';
exports.description = 'Run query';
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
const handler = async ({ endpoint, token, sql }) => {
    const client = (0, api_1.createClient)(endpoint, token);
    const results = await client.query.run({ q: sql });
    console.log(JSON.stringify(results.objects));
};
exports.handler = handler;
//# sourceMappingURL=query.js.map