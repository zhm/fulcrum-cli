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
const resource_1 = __importDefault(require("./resource"));
class Changeset extends resource_1.default {
    get resourceName() {
        return 'changeset';
    }
    get resourcesName() {
        return 'changesets';
    }
    close(id, callback) {
        const options = {
            method: 'PUT',
            path: this.memberAction(id, 'close'),
        };
        return this.call(options, (err, res, body) => {
            if (err) {
                return callback(err);
            }
            return callback(null, JSON.parse(body)[this.resourceName]);
        });
    }
}
exports.default = Changeset;
list_1.default.includeInto(Changeset);
find_1.default.includeInto(Changeset);
create_1.default.includeInto(Changeset);
update_1.default.includeInto(Changeset);
//# sourceMappingURL=changeset.js.map