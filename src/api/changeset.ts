// @ts-nocheck

import List from './actions/list';
import Find from './actions/find';
import Create from './actions/create';
import Update from './actions/update';
import Resource from './resource';
import applyMixins from '../utils/mixin';

export default class Changeset extends Resource {
  get resourceName() {
    return 'changeset';
  }

  get resourcesName() {
    return 'changesets';
  }

  async close(id) {
    const json = await this.call({
      method: 'PUT',
      path: this.memberAction(id, 'close'),
    });

    return json[this.resourceName];
  }
}

interface Changeset extends List, Find, Create, Update {}

applyMixins(Changeset, [List, Find, Create, Update]);
