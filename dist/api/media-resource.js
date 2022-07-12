"use strict";
// @ts-nocheck
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = __importDefault(require("uuid"));
const list_1 = __importDefault(require("./actions/list"));
const find_1 = __importDefault(require("./actions/find"));
const create_1 = __importDefault(require("./actions/create"));
const resource_1 = __importDefault(require("./resource"));
class MediaResource extends resource_1.default {
    optionsForUpload(file, attributes) {
        const options = {
            method: 'POST',
            path: this.createAction,
            fields: {},
            files: {},
        };
        options.fields[`${this.resourceName}[access_key]`] = attributes.access_key || uuid_1.default.v4();
        options.files[`${this.resourceName}[file]`] = file;
        return options;
    }
    async create(file, attributes, progress) {
        const options = this.optionsForUpload(file, attributes);
        options.progress = progress;
        const body = await this.call(options);
        return JSON.parse(body)[this.resourceName];
    }
    async downloadVersion(accessKey, version, callback) {
        const body = await this.find(accessKey);
        return this.download(body[version], callback);
    }
    original(accessKey) {
        this.downloadVersion(accessKey, 'original');
    }
}
exports.default = MediaResource;
list_1.default.includeInto(MediaResource);
find_1.default.includeInto(MediaResource);
create_1.default.includeInto(MediaResource);
//# sourceMappingURL=media-resource.js.map