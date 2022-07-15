"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.command = void 0;
const api_1 = require("../shared/api");
exports.command = 'delete-records';
exports.description = 'Delete records';
const builder = (yargs) => {
    yargs
        .option('sql', {
        alias: 'sql',
        type: 'string',
        description: 'SQL query',
    })
        .option('where', {
        alias: 'w',
        type: 'string',
        default: '',
        description: 'SQL where clause',
    })
        .option('form', {
        required: true,
        alias: 'f',
        type: 'string',
        description: 'Form ID',
    })
        .option('comment', {
        type: 'string',
        description: 'Comment',
    })
        .strict(false);
};
exports.builder = builder;
const handler = async ({ endpoint, token, sql, form: formID, comment, where, }) => {
    const client = (0, api_1.createClient)(endpoint, token);
    const form = await (0, api_1.fetchForm)(client, formID);
    const records = await (0, api_1.fetchRecordsBySQL)(client, form, sql ?? `select * from "${formID}"`, where);
    await (0, api_1.deleteRecords)(client, form, records, comment ?? 'Delete records');
};
exports.handler = handler;
//# sourceMappingURL=delete-records.js.map