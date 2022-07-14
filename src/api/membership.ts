// @ts-nocheck

import List from './actions/list';
import Find from './actions/find';
import Create from './actions/create';
import Update from './actions/update';
import Delete from './actions/delete';
import Resource from './resource';

export default class Membership extends Resource {
  get resourceName() {
    return 'membership';
  }

  get resourcesName() {
    return 'memberships';
  }

  async changePermissions(changes) {
    const options = {
      method: 'POST',
      path: this.collectionAction('change_permissions'),
      data: { change: changes },
    };

    const json = await this.call(options);

    return json[this.resourceName];
  }
}

List.includeInto(Membership);
Find.includeInto(Membership);
Create.includeInto(Membership);
Update.includeInto(Membership);
Delete.includeInto(Membership);
