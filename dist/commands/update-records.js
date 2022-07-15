"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.command = void 0;
const api_1 = require("../shared/api");
const update_records_1 = require("../shared/update-records");
exports.command = 'update-records';
exports.description = 'Update records';
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
        .option('field', {
        required: true,
        type: 'array',
        description: 'Field data name',
    })
        .option('value', {
        required: true,
        type: 'array',
        description: 'Field value',
    })
        .option('comment', {
        type: 'string',
        description: 'Comment',
    })
        .strict(false);
};
exports.builder = builder;
const handler = async ({ endpoint, token, sql, form: formID, comment, field, value, where, }) => {
    const client = (0, api_1.createClient)(endpoint, token);
    const context = await (0, api_1.fetchContext)(client);
    const form = await (0, api_1.fetchForm)(client, formID);
    const records = await (0, api_1.fetchRecordsBySQL)(client, form, sql ?? `select * from "${formID}"`, where);
    if (field.length !== value.length) {
        console.error('Must pass the same number of fields and values');
        return;
    }
    await (0, update_records_1.updateRecordFields)(client, form, records, context, field, value, comment ?? 'Updating records');
};
exports.handler = handler;
//# sourceMappingURL=update-records.js.map