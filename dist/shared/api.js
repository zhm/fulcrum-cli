"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeRecordOperatons = exports.deleteRecords = exports.saveRecords = exports.saveRecord = exports.deleteRecord = exports.closeChangeset = exports.createChangeset = exports.fetchChangeset = exports.fetchRecordsBySQL = exports.fetchRecord = exports.fetchForm = exports.fetchContext = exports.createClient = exports.batch = void 0;
const axios_1 = __importDefault(require("axios"));
const lodash_1 = require("lodash");
const fulcrum_core_1 = require("fulcrum-core");
const client_1 = __importDefault(require("../api/client"));
const log_1 = require("./log");
async function batch(objects, callback) {
    for (const list of (0, lodash_1.chunk)(objects, process.env.FULCRUM_BATCH_SIZE ?? 10)) {
        await Promise.all(list.map(callback));
    }
}
exports.batch = batch;
function createClient(endpoint, token) {
    return new client_1.default({
        base: `${endpoint}/api/v2`,
        config: {
            query_url: endpoint,
        },
        token,
        request: axios_1.default,
        userAgent: 'Fulcrum CLI',
    });
}
exports.createClient = createClient;
async function fetchContext(client) {
    console.log('fetching context');
    const json = await client.user.find();
    const user = new fulcrum_core_1.User(json);
    const context = json.contexts.find((o) => o.id === json.current_organization.id);
    const role = new fulcrum_core_1.Role(context.role);
    const organization = {
        id: context.id,
        name: context.name,
    };
    return { user, role, organization };
}
exports.fetchContext = fetchContext;
async function fetchForm(client, id) {
    console.log('fetching form', id);
    return new fulcrum_core_1.Form(await client.forms.find(id));
}
exports.fetchForm = fetchForm;
async function fetchRecord(client, id, form) {
    console.log('fetching record', id);
    return new fulcrum_core_1.Record(await client.records.find(id), form);
}
exports.fetchRecord = fetchRecord;
async function fetchRecordsBySQL(client, form, sql, where) {
    console.log('fetching records by sql', sql, where);
    const query = where ? `${sql} WHERE ${where}` : sql;
    const result = await client.query.run({ q: query });
    const ids = result.objects.map((o) => o._record_id ?? o.record_id ?? o.id);
    const records = [];
    await batch(ids, async (id) => {
        const record = await fetchRecord(client, id, form);
        if (record.projectID) {
            console.log('fetching project', record.projectID);
            const project = await client.projects.find(record.projectID);
            record.project = project;
        }
        records.push(record);
    });
    return records;
}
exports.fetchRecordsBySQL = fetchRecordsBySQL;
function buildChangesetAttributes(form, comment) {
    return {
        form_id: form.id,
        metadata: {
            comment,
            application: 'Fulcrum CLI',
            platform: 'cli',
            platform_version: '1.0.0',
        },
    };
}
async function fetchChangeset(client, id) {
    console.log('fetching changeset', id);
    return new fulcrum_core_1.Changeset(await client.changesets.find(id));
}
exports.fetchChangeset = fetchChangeset;
async function createChangeset(client, form, comment) {
    console.log('creating changeset', (0, log_1.blue)(form.id), (0, log_1.green)(comment));
    const json = await client.changesets.create(buildChangesetAttributes(form, comment));
    return new fulcrum_core_1.Changeset(json);
}
exports.createChangeset = createChangeset;
async function closeChangeset(client, changeset) {
    console.log('closing changeset', (0, log_1.blue)(changeset.id));
    return client.changesets.close(changeset.id);
}
exports.closeChangeset = closeChangeset;
async function deleteRecord(client, id, changeset) {
    console.log('deleting record', (0, log_1.blue)(id));
    return client.records.delete(id, changeset.id);
}
exports.deleteRecord = deleteRecord;
async function saveRecord(client, record, changeset) {
    record.changeset = changeset;
    console.log(`${record.id ? 'updating' : 'creating'} record`, (0, log_1.blue)(record.id));
    const json = await client.records.create(record.toJSON());
    record.updateFromAPIAttributes(json);
    return record;
}
exports.saveRecord = saveRecord;
async function saveRecords(client, form, records, comment) {
    if (records.length === 0) {
        return;
    }
    const changeset = await createChangeset(client, form, comment);
    await batch(records, (record) => saveRecord(client, record, changeset));
    await closeChangeset(client, changeset);
}
exports.saveRecords = saveRecords;
async function deleteRecords(client, form, records, comment) {
    if (records.length === 0) {
        return;
    }
    const changeset = await createChangeset(client, form, comment);
    await batch(records, (record) => deleteRecord(client, record.id, changeset));
    await closeChangeset(client, changeset);
}
exports.deleteRecords = deleteRecords;
async function executeRecordOperatons(client, form, operations, comment) {
    if (operations.length === 0) {
        return;
    }
    const newChangeset = await createChangeset(client, form, comment);
    await batch(operations, async (operation) => {
        if (operation.type === 'delete') {
            return deleteRecord(client, operation.id, newChangeset);
        }
        return saveRecord(client, operation.record, newChangeset);
    });
    await closeChangeset(client, newChangeset);
}
exports.executeRecordOperatons = executeRecordOperatons;
//# sourceMappingURL=api.js.map