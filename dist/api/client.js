"use strict";
// @ts-nocheck
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const form_1 = __importDefault(require("./form"));
const record_1 = __importDefault(require("./record"));
const choice_list_1 = __importDefault(require("./choice-list"));
const classification_set_1 = __importDefault(require("./classification-set"));
const membership_1 = __importDefault(require("./membership"));
const project_1 = __importDefault(require("./project"));
const layer_1 = __importDefault(require("./layer"));
const role_1 = __importDefault(require("./role"));
const photo_1 = __importDefault(require("./photo"));
const attachment_1 = __importDefault(require("./attachment"));
const video_1 = __importDefault(require("./video"));
const audio_1 = __importDefault(require("./audio"));
const signature_1 = __importDefault(require("./signature"));
const changeset_1 = __importDefault(require("./changeset"));
const query_1 = __importDefault(require("./query"));
const export_1 = __importDefault(require("./export"));
const view_1 = __importDefault(require("./view"));
const permission_1 = __importDefault(require("./permission"));
const share_1 = __importDefault(require("./share"));
const report_template_1 = __importDefault(require("./report-template"));
const workflow_1 = __importDefault(require("./workflow"));
const user_1 = __importDefault(require("./user"));
const workflow_execution_1 = __importDefault(require("./workflow_execution"));
const external_contributions_api_client_1 = __importDefault(require("./external-contributions-api-client"));
const BASE = '/api/v2';
const UA = 'Fulcrum Web';
class Client {
    constructor(options) {
        this.request = options.request;
        this.token = options.token;
        this.base = options.base || BASE;
        this.userAgent = options.userAgent || UA;
        this.config = options.config;
    }
    urlFromPath(path, base) {
        return `${(base || this.base)}/${path}`;
    }
    call(requestOptions) {
        const options = requestOptions || {};
        if (options.path) {
            options.url = this.urlFromPath(options.path, options.base);
        }
        options.headers = {
            'User-Agent': this.userAgent,
            'X-Require-Media': 'false',
            Accept: 'application/json',
        };
        if (!options.params) {
            options.params = {};
        }
        if (this.token) {
            options.params.token = this.token;
        }
        return new Promise((resolve, reject) => {
            this.request(options)
                .then((response) => {
                resolve(response.data);
            })
                .catch((error) => {
                if (error.response) {
                    console.error('Request Error', error.message, error.response.status, error.response.data);
                }
                else {
                    console.error('Request Error', error.message);
                }
                reject(error);
            });
        });
    }
    get(options) {
        return this.call({ method: 'GET', ...options });
    }
    post(options) {
        return this.call({ method: 'POST', ...options });
    }
    put(options) {
        return this.call({ method: 'PUT', ...options });
    }
    delete(options) {
        return this.call({ method: 'DELETE', ...options });
    }
    url(path, base) {
        return this.urlFromPath(path, base);
    }
    get user() {
        if (!this._user) {
            this._user = new user_1.default(this);
        }
        return this._user;
    }
    get choiceLists() {
        if (!this._choiceLists) {
            this._choiceLists = new choice_list_1.default(this);
        }
        return this._choiceLists;
    }
    get classificationSets() {
        if (!this._classificationSets) {
            this._classificationSets = new classification_set_1.default(this);
        }
        return this._classificationSets;
    }
    get forms() {
        if (!this._forms) {
            this._forms = new form_1.default(this);
        }
        return this._forms;
    }
    get records() {
        if (!this._records) {
            this._records = new record_1.default(this);
        }
        return this._records;
    }
    get memberships() {
        if (!this._memberships) {
            this._memberships = new membership_1.default(this);
        }
        return this._memberships;
    }
    get projects() {
        if (!this._projects) {
            this._projects = new project_1.default(this);
        }
        return this._projects;
    }
    get layers() {
        if (!this._layers) {
            this._layers = new layer_1.default(this);
        }
        return this._layers;
    }
    get roles() {
        if (!this._roles) {
            this._roles = new role_1.default(this);
        }
        return this._roles;
    }
    get photos() {
        if (!this._photos) {
            this._photos = new photo_1.default(this);
        }
        return this._photos;
    }
    get attachments() {
        if (!this._attachments) {
            this._attachments = new attachment_1.default(this);
        }
        return this._attachments;
    }
    get videos() {
        if (!this._videos) {
            this._videos = new video_1.default(this);
        }
        return this._videos;
    }
    get audio() {
        if (!this._audio) {
            this._audio = new audio_1.default(this);
        }
        return this._audio;
    }
    get signatures() {
        if (!this._signatures) {
            this._signatures = new signature_1.default(this);
        }
        return this._signatures;
    }
    get changesets() {
        if (!this._changesets) {
            this._changesets = new changeset_1.default(this);
        }
        return this._changesets;
    }
    get exports() {
        if (!this._exports) {
            this._exports = new export_1.default(this);
        }
        return this._exports;
    }
    get views() {
        if (!this._views) {
            this._views = new view_1.default(this);
        }
        return this._views;
    }
    get shares() {
        if (!this._shares) {
            this._shares = new share_1.default(this);
        }
        return this._shares;
    }
    get permissions() {
        if (!this._permissions) {
            this._permissions = new permission_1.default(this);
        }
        return this._permissions;
    }
    get reportTemplates() {
        if (!this._reportTemplates) {
            this._reportTemplates = new report_template_1.default(this);
        }
        return this._reportTemplates;
    }
    get query() {
        if (!this._query) {
            this._query = new query_1.default(this);
        }
        return this._query;
    }
    get workflows() {
        if (!this._workflows) {
            this._workflows = new workflow_1.default(this);
        }
        return this._workflows;
    }
    get workflowExecutions() {
        if (!this._workflowExecutions) {
            this._workflowExecutions = new workflow_execution_1.default(this);
        }
        return this._workflowExecutions;
    }
    get externalContributions() {
        if (!this._externalContributions) {
            this._externalContributions = new external_contributions_api_client_1.default(this.config.external_contributions_url, this.token);
        }
        return this._externalContributions;
    }
}
exports.default = Client;
//# sourceMappingURL=client.js.map