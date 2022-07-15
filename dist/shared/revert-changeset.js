"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const fulcrum_core_1 = require("fulcrum-core");
const api_1 = require("./api");
async function revertChangeset(client, changesetID) {
    console.log('reverting changeset', changesetID);
    const changeset = await (0, api_1.fetchChangeset)(client, changesetID);
    const form = await (0, api_1.fetchForm)(client, changeset._formID);
    const history = await client.records.history({ changeset_id: changesetID });
    console.log('found', history.objects.length, 'records');
    const operations = [];
    for (const historyRecord of history.objects) {
        switch (historyRecord.history_change_type) {
            case 'u': {
                const { objects: allVersions } = await client.records.history({
                    record_id: historyRecord.id,
                });
                const currentVersion = (0, lodash_1.last)(allVersions);
                const previousVersion = allVersions.find((o) => o.version === historyRecord.version - 1);
                operations.push({
                    type: 'update',
                    record: new fulcrum_core_1.Record({
                        ...previousVersion, version: currentVersion.version,
                    }, form),
                });
                break;
            }
            case 'c': {
                operations.push({
                    type: 'delete',
                    id: historyRecord.id,
                });
                break;
            }
            case 'd': {
                operations.push({
                    type: 'create',
                    record: new fulcrum_core_1.Record({
                        ...historyRecord,
                        id: null,
                    }, form),
                });
                break;
            }
            default: throw new Error(`invalid history change type: ${history.history_change_type}`);
        }
    }
    const newChangeset = await (0, api_1.createChangeset)(client, form, `Reverting changeset ${changesetID}`);
    for (const operation of operations) {
        if (operation.type === 'delete') {
            await (0, api_1.deleteRecord)(client, operation.id, newChangeset);
        }
        else {
            await (0, api_1.saveRecord)(client, operation.record, newChangeset);
        }
    }
    await (0, api_1.closeChangeset)(client, newChangeset);
}
exports.default = revertChangeset;
//# sourceMappingURL=revert-changeset.js.map