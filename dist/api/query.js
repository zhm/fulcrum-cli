"use strict";
// @ts-nocheck
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const resource_1 = __importDefault(require("./resource"));
const page_1 = __importDefault(require("./page"));
class Query extends resource_1.default {
    async ast(params) {
        const options = {
            url: `${this.client.config.query_url}/api/v2/query`,
            params: {
                ...params, ast: true, format: 'json', token: this.client.token,
            },
        };
        const json = await this.client.call(options);
        return json;
    }
    async run(params) {
        const options = {
            url: `${this.client.config.query_url}/api/v2/query`,
            params: {
                ...params, arrays: 1, format: 'json', token: this.client.token,
            },
        };
        const parsed = await this.client.call(options);
        const objects = [];
        for (const row of parsed.rows) {
            const object = {};
            const { fields } = parsed;
            for (let i = 0; i < fields.length; ++i) {
                object[fields[i].name] = row[i];
            }
            objects.push(object);
        }
        parsed.objects = objects;
        const page = new page_1.default(parsed, 'objects');
        page.fields = parsed.fields;
        page.columns = parsed.columns;
        return page;
    }
    async queryRecords({ q }) {
        const data = await this.run({ q });
        for (const object of data.objects) {
            if (object.hasOwnProperty('form_values')) {
                object.form_values = JSON.parse(object.form_values);
            }
        }
        return data.objects;
    }
}
exports.default = Query;
//# sourceMappingURL=query.js.map