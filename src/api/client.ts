// @ts-nocheck

import { mkdirp } from 'mkdirp';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import contentDisposition from 'content-disposition';
import retry, { AbortError } from 'p-retry';
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
import Report from './report';
import User from './user';
import WorkflowExecution from './workflow_execution';
import { log } from '../utils/logger';

export interface Config {
  query_url: string;
  attachments_url: string;
  external_contributions_url: string;
}

const BASE = '/api/v2';
const UA = 'Fulcrum Web';

export type FileDownloadResult = {
  response: AxiosResponse;
  responseFileName: string | null;
  outputFilePath: string;
};

export type FileDownloadProcessor = (result: FileDownloadResult) => Promise<any>;

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

  constructor(options) {
    this.request = options.request;
    this.token = options.token;
    this.base = options.base ?? BASE;
    this.userAgent = options.userAgent ?? UA;
    this.config = options.config;
  }

  urlFromPath(urlPath: string, prefix: string, base: string) {
    return `${(base || this.base)}/${prefix}/${urlPath}`;
  }

  call(requestOptions) {
    const options = requestOptions || {};

    if (options.path) {
      options.url = this.urlFromPath(options.path, 'api/v2', options.base);
    }

    options.headers = {
      ...this.apiHeaders,
      ...options.headers,
    };

    if (!options.params) {
      options.params = {};
    }

    return this.executeRequestWithRetries(options);
  }

  async executeRequestWithRetries(options: AxiosRequestConfig) {
    const run = async () => {
      try {
        return await this.executeRequest(options);
      } catch (err) {
        const status = err.response?.status;

        if (status === 401) {
          log.error('Unauthorized');
          throw new AbortError(err);
        }

        if (status === 403) {
          log.error('Forbidden');
          throw new AbortError(err);
        }

        if (status === 404) {
          log.error('Not found');
          throw new AbortError(err);
        }

        if (status === 422) {
          log.error('Unprocessable entity');
          throw new AbortError(err);
        }

        throw err;
      }
    };

    return retry(run, { retries: 5 });
  }

  executeRequest(options: AxiosRequestConfig) {
    return new Promise((resolve, reject) => {
      axios(options)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          this.logError(error, options, error.response);

          reject(error);
        });
    });
  }

  executeFileStreamRequest(requestOptions: AxiosRequestConfig, outputFileName: string) {
    return new Promise(async (resolve, reject) => {
      const destStream = fs.createWriteStream(outputFileName);

      try {
        const config = {
          method: 'GET',
          responseType: 'stream',
          ...requestOptions,
        };

        const streamResponse = await axios(config)
          .then((response) => new Promise((resolve, reject) => {
            response.data.pipe(destStream);

            destStream
              .on('error', (err) => {
                this.logError(err, requestOptions, response);

                reject({ response: { statusText: err.message } }); // Use same shape as axios error
              })
              .on('close', () => {
                resolve(response);
              });
          }));

        resolve(streamResponse);
      } catch (err) {
        destStream.close();
        reject(err);
      }
    });
  }

  logError(error: any, options: AxiosRequestConfig, response: AxiosResponse | null) {
    if (response) {
      log.error({ context: 'http' }, error.message, options.url, error.response.status, JSON.stringify(error.response.data));
    } else {
      log.error({ context: 'http' }, error.message, options.url);
    }
  }

  get apiHeaders() {
    return {
      Accept: 'application/json',
      'User-Agent': this.userAgent,
      'X-Require-Media': 'false',
      'X-ApiToken': this.token,
    };
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
    return this.urlFromPath(path, 'api/v2/', base);
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

  get reports() {
    if (!this._reports) {
      this._reports = new Report(this);
    }
    return this._reports;
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

  fetchSync(): Promise<any> {
    return this.get({ url: this.urlFromPath('sync', '/api/_private') });
  }

  async withDownloadedFile(
    options: AxiosRequestConfig,
    process: FileDownloadProcessor,
  ): Promise<any> {
    let result = null;

    try {
      result = await this.downloadFile(options);

      return await process(result);
    } finally {
      if (result) {
        try {
          await fs.promises.unlink(result.outputFilePath);
        } catch (err) {
          // Ignore errors
        }
      }
    }
  }

  async downloadFile(
    options: AxiosRequestConfig,
  ): FileDownloadResult {
    await mkdirp('tmp');

    const outputFilePath = path.join('tmp', randomUUID());

    const response = await this.executeFileStreamRequest(options, outputFilePath);

    let responseFileName = null;

    if (response.headers['content-disposition']) {
      const disposition = contentDisposition.parse(response.headers['content-disposition']);

      responseFileName = disposition?.parameters?.filename;
    }

    return { response, responseFileName, outputFilePath };
  }
}
