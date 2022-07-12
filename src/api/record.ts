// @ts-nocheck

import List from './actions/list';
import Find from './actions/find';
import Create from './actions/create';
import Update from './actions/update';
import Delete from './actions/delete';
import History from './actions/history';
import Resource from './resource';
import Page from './page';

export default class Record extends Resource {
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

    return new Page(JSON.parse(body), this.resourcesName);
  }
}

List.includeInto(Record);
Find.includeInto(Record);
Create.includeInto(Record);
Update.includeInto(Record);
Delete.includeInto(Record);
History.includeInto(Record);
