// @ts-nocheck

import List from './actions/list';
import Resource from './resource';

export default class Permission extends Resource {
  get resourceName() {
    return 'permission';
  }

  get resourcesName() {
    return 'permissions';
  }

  async formMembers(formId) {
    const options = {
      method: 'GET',
      path: `${this.collection()}?type=form_members&object_id=${formId}`,
    };

    const body = await this.call(options);
    return JSON.parse(body)[this.resourcesName];
  }
}

List.includeInto(Permission);
