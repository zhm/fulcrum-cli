// @ts-nocheck

import applyMixins from '../utils/mixin';
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

    const json = await this.call(options);

    return json[this.resourcesName];
  }
}

interface Permission extends List {}
applyMixins(Permission, [List]);
