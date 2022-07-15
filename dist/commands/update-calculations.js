"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.command = void 0;
const api_1 = require("../shared/api");
const update_calculations_1 = require("../shared/update-calculations");
exports.command = 'update-calculations';
exports.description = 'Update calculation fields';
const builder = (yargs) => {
    yargs
        .option('sql', {
        alias: 'sql',
        type: 'string',
        description: 'SQL query',
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
const handler = async ({ endpoint, token, sql, form: formID, comment, }) => {
    const client = (0, api_1.createClient)(endpoint, token);
    const context = await (0, api_1.fetchContext)(client);
    const form = await (0, api_1.fetchForm)(client, formID);
    const records = await (0, api_1.fetchRecordsBySQL)(client, form, sql ?? `select * from "${formID}"`);
    for (const record of records) {
        await (0, update_calculations_1.updateCalculations)(record, context);
    }
    await (0, api_1.saveRecords)(client, form, records, comment ?? 'Updating calculations');
    await (0, update_calculations_1.shutdownSandbox)();
};
exports.handler = handler;
//# sourceMappingURL=update-calculations.js.map