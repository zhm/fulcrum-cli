"use strict";
// @ts-nocheck
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const list_1 = __importDefault(require("./actions/list"));
const find_1 = __importDefault(require("./actions/find"));
const create_1 = __importDefault(require("./actions/create"));
const update_1 = __importDefault(require("./actions/update"));
const delete_1 = __importDefault(require("./actions/delete"));
const history_1 = __importDefault(require("./actions/history"));
const resource_1 = __importDefault(require("./resource"));
const page_1 = __importDefault(require("./page"));
class Record extends resource_1.default {
    get resourceName() {
        return 'record';
    }
    get resourcesName() {
        return 'records';
    }
    delete(id, changesetID, callback) {
        const options = {
            method: 'DELETE',
            path: this.member(id),
        };
        if (changesetID != null) {
            options.body = {
                record: {
                    changeset_id: changesetID,
                },
            };
        }
        return this.call(options, callback);
    }
    async query(params) {
        const options = {
            method: 'POST',
            path: 'records/lookup',
            body: params,
        };
        const body = await this.call(options);
        return new page_1.default(JSON.parse(body), this.resourcesName);
    }
}
exports.default = Record;
list_1.default.includeInto(Record);
find_1.default.includeInto(Record);
create_1.default.includeInto(Record);
update_1.default.includeInto(Record);
delete_1.default.includeInto(Record);
history_1.default.includeInto(Record);
//# sourceMappingURL=record.js.map