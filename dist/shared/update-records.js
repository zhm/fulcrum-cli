"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRecordFields = exports.updateRecords = void 0;
const api_1 = require("./api");
const update_calculations_1 = require("./update-calculations");
async function updateRecords(client, form, records, context, comment, callback) {
    const operations = [];
    for (const record of records) {
        const operation = await callback(record);
        if (operation) {
            if (operation.record) {
                await (0, update_calculations_1.updateCalculations)(record, context);
            }
            operations.push(operation);
        }
    }
    await (0, api_1.executeRecordOperatons)(client, form, operations, comment);
    await (0, update_calculations_1.shutdownSandbox)();
}
exports.updateRecords = updateRecords;
async function updateRecordFields(client, form, records, context, fields, values, comment) {
    const updateElement = (record, dataName, dataValue) => {
        const element = record.form.find(dataName);
        let newValue = null;
        if (dataValue != null) {
            newValue = record.formValues.createValueFromString(element, dataValue);
        }
        record.formValues.set(element.key, newValue);
    };
    const updateStatus = (record, dataName, dataValue) => {
        record.status = dataValue ?? null;
    };
    const updateProject = (record, dataName, dataValue) => {
        record.projectID = dataValue ?? null;
    };
    const updateAssignment = (record, dataName, dataValue) => {
        record.assignedToID = dataValue ?? null;
    };
    const UPDATERS = {
        '@status': updateStatus,
        '@project': updateProject,
        '@assigned_to': updateAssignment,
    };
    const callback = async (record) => {
        for (let index = 0; index < fields.length; ++index) {
            const dataName = fields[index];
            const dataValue = values[index] !== '' ? values[index] : null;
            const updater = UPDATERS[dataName] ?? updateElement;
            updater(record, dataName, dataValue);
        }
        return { type: 'update', record };
    };
    await updateRecords(client, form, records, context, comment ?? 'Updating records', callback);
}
exports.updateRecordFields = updateRecordFields;
//# sourceMappingURL=update-records.js.map