// @ts-nocheck

import List from './actions/list';
import Find from './actions/find';
import Resource from './resource';
import applyMixins from '../utils/mixin';

export default class Role extends Resource {
  get resourceName() {
    return 'role';
  }

  get resourcesName() {
    return 'roles';
  }
}

interface Role extends List, Find {}
applyMixins(Role, [List, Find]);
