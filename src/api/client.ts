// @ts-nocheck

import Form from './form';
import Record from './record';
import ChoiceList from './choice-list';
import ClassificationSet from './classification-set';
import Membership from './membership';
import Project from './project';
import Layer from './layer';
import Role from './role';
import Photo from './photo';
import Attachment from './attachment';
import Video from './video';
import Audio from './audio';
import Signature from './signature';
import Changeset from './changeset';
import Query from './query';
import Export from './export';
import View from './view';
import Permission from './permission';
import Share from './share';
import ReportTemplate from './report-template';
import Workflow from './workflow';
import User from './user';
import WorkflowExecution from './workflow_execution';
import ExternalContributionsApiClient from './external-contributions-api-client';

export interface Config {
  query_url: string;
  attachments_url: string;
  external_contributions_url: string;
}

const BASE = '/api/v2';
const UA = 'Fulcrum Web';

export default class Client {
  config: Config;

  token: string;

  base: string;

  userAgent: string;

  request: Function;

  _choiceLists: any;

  _classificationSets: any;

  _forms: any;

  _records: any;

  _projects: any;

  _memberships: any;

  _roles: any;

  _layers: any;

  _photos: any;

  _videos: any;

  _audio: any;

  _signatures: any;

  _attachments: any;

  _exports: any;

  _changesets: any;

  _shares: any;

  _views: any;

  _permissions: any;

  _user: any;

  _reportTemplates: any;

  _query: any;

  _workflows: any;

  _workflowExecutions: any;

  _externalContributions: any;

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

    // TODO(zhm) using the query string token param eliminates a lot of OPTIONS cors preflight requests
    options.headers = {
      'User-Agent': this.userAgent,
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
          } else {
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
      this._user = new User(this);
    }
    return this._user;
  }

  get choiceLists() {
    if (!this._choiceLists) {
      this._choiceLists = new ChoiceList(this);
    }
    return this._choiceLists;
  }

  get classificationSets() {
    if (!this._classificationSets) {
      this._classificationSets = new ClassificationSet(this);
    }
    return this._classificationSets;
  }

  get forms() {
    if (!this._forms) {
      this._forms = new Form(this);
    }
    return this._forms;
  }

  get records() {
    if (!this._records) {
      this._records = new Record(this);
    }
    return this._records;
  }

  get memberships() {
    if (!this._memberships) {
      this._memberships = new Membership(this);
    }
    return this._memberships;
  }

  get projects() {
    if (!this._projects) {
      this._projects = new Project(this);
    }
    return this._projects;
  }

  get layers() {
    if (!this._layers) {
      this._layers = new Layer(this);
    }
    return this._layers;
  }

  get roles() {
    if (!this._roles) {
      this._roles = new Role(this);
    }
    return this._roles;
  }

  get photos() {
    if (!this._photos) {
      this._photos = new Photo(this);
    }
    return this._photos;
  }

  get attachments() {
    if (!this._attachments) {
      this._attachments = new Attachment(this);
    }
    return this._attachments;
  }

  get videos() {
    if (!this._videos) {
      this._videos = new Video(this);
    }
    return this._videos;
  }

  get audio() {
    if (!this._audio) {
      this._audio = new Audio(this);
    }
    return this._audio;
  }

  get signatures() {
    if (!this._signatures) {
      this._signatures = new Signature(this);
    }
    return this._signatures;
  }

  get changesets() {
    if (!this._changesets) {
      this._changesets = new Changeset(this);
    }
    return this._changesets;
  }

  get exports() {
    if (!this._exports) {
      this._exports = new Export(this);
    }
    return this._exports;
  }

  get views() {
    if (!this._views) {
      this._views = new View(this);
    }
    return this._views;
  }

  get shares() {
    if (!this._shares) {
      this._shares = new Share(this);
    }
    return this._shares;
  }

  get permissions() {
    if (!this._permissions) {
      this._permissions = new Permission(this);
    }
    return this._permissions;
  }

  get reportTemplates() {
    if (!this._reportTemplates) {
      this._reportTemplates = new ReportTemplate(this);
    }
    return this._reportTemplates;
  }

  get query() {
    if (!this._query) {
      this._query = new Query(this);
    }
    return this._query;
  }

  get workflows() {
    if (!this._workflows) {
      this._workflows = new Workflow(this);
    }
    return this._workflows;
  }

  get workflowExecutions() {
    if (!this._workflowExecutions) {
      this._workflowExecutions = new WorkflowExecution(this);
    }
    return this._workflowExecutions;
  }

  get externalContributions() {
    if (!this._externalContributions) {
      this._externalContributions = new ExternalContributionsApiClient(this.config.external_contributions_url, this.token);
    }

    return this._externalContributions;
  }
}
