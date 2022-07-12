// @ts-nocheck

import List from './actions/list';
import Find from './actions/find';
import Resource from './resource';

export default class Role extends Resource {
  get resourceName() {
    return 'role';
  }

  get resourcesName() {
    return 'roles';
  }
}

List.includeInto(Role);
Find.includeInto(Role);
