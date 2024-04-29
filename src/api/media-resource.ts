// @ts-nocheck
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import List from './actions/list';
import Find from './actions/find';
import Create from './actions/create';
import Resource from './resource';
import applyMixins from '../utils/mixin';

export default class MediaResource extends Resource {
  optionsForUpload(file, attributes) {
    const data = new FormData();

    data.append(`${this.resourceName}[access_key]`, attributes.access_key || uuidv4());
    data.append(`${this.resourceName}[file]`, file);

    const options = {
      method: 'POST',
      path: this.createAction,
      'Content-Type': 'multipart/form-data',
      data,
    };

    return options;
  }

  async create(file, attributes, progress) {
    const options = this.optionsForUpload(file, attributes);

    options.progress = progress;

    const json = await this.call(options);

    return json[this.resourceName];
  }

  async downloadVersion(accessKey, version) {
    const body = await this.find(accessKey);

    return this.download(body[version]);
  }

  original(accessKey) {
    this.downloadVersion(accessKey, 'original');
  }
}

interface MediaResource extends List, Find, Create {}
applyMixins(MediaResource, [List, Find, Create]);
