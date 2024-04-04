// @ts-nocheck

import List from './actions/list';
import Find from './actions/find';
import Create from './actions/create';
import Delete from './actions/delete';
import Resource from './resource';
import applyMixins from '../utils/mixin';

export default class Share extends Resource {
  get resourceName() {
    return 'share';
  }

  get resourcesName() {
    return 'shares';
  }
}

interface Share extends List, Find, Create, Delete {}
applyMixins(Share, [List, Find, Create, Delete]);
