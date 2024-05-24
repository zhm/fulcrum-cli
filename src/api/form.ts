// @ts-nocheck

import List from './actions/list';
import Find from './actions/find';
import Create from './actions/create';
import Update from './actions/update';
import Delete from './actions/delete';
import Resource from './resource';
import applyMixins from '../utils/mixin';
import Page from './page';

export default class Form extends Resource {
  get resourceName() {
    return 'form';
  }

  get resourcesName() {
    return 'forms';
  }

  async history(params) {
    const options = {
      method: 'GET',
      path: this.collectionAction('history'),
      params,
    };

    const json = await this.call(options);

    return new Page(json, this.resourcesName);
  }

  async uploadImage(id, file) {
    const data = new FormData();

    data.append('[form][image]', file);

    const options = {
      method: 'POST',
      path: this.memberAction(id, 'upload_image', null),
      'Content-Type': 'multipart/form-data',
      data,
    };

    return this.call(options);
  }

  async systemApps() {
    const options = {
      method: 'GET',
      path: this.collectionAction('system_apps', null),
    };

    const json = await this.call(options);

    return json;
  }
}

interface Form extends List, Find, Create, Update, Delete {} // eslint-disable-line
applyMixins(Form, [List, Find, Create, Update, Delete]);
