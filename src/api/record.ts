// @ts-nocheck

import List from './actions/list';
import Find from './actions/find';
import Create from './actions/create';
import Update from './actions/update';
import Delete from './actions/delete';
import Resource from './resource';
import Page from './page';
import applyMixins from '../utils/mixin';

export default class Record extends Resource {
  get resourceName() {
    return 'record';
  }

  get resourcesName() {
    return 'records';
  }

  delete(id, changesetID) {
    const options = {
      method: 'DELETE',
      path: this.member(id),
    };

    if (changesetID != null) {
      options.data = {
        record: {
          changeset_id: changesetID,
        },
      };
    }

    return this.call(options);
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

  async query(params) {
    const options = {
      method: 'POST',
      path: 'records/lookup',
      data: params,
    };

    const json = await this.call(options);

    return new Page(json, this.resourcesName);
  }
}

interface Record extends List, Find, Create, Update, Delete {}
applyMixins(Record, [List, Find, Create, Update, Delete]);
