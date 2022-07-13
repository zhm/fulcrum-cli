// @ts-nocheck

import List from './actions/list';
import Find from './actions/find';
import Create from './actions/create';
import Update from './actions/update';
import Resource from './resource';

export default class Changeset extends Resource {
  get resourceName() {
    return 'changeset';
  }

  get resourcesName() {
    return 'changesets';
  }

  async close(id, callback) {
    const options = {
      method: 'PUT',
      path: this.memberAction(id, 'close'),
    };

    const json = await this.call(options);

    return json[this.resourceName];
  }
}

List.includeInto(Changeset);
Find.includeInto(Changeset);
Create.includeInto(Changeset);
Update.includeInto(Changeset);
