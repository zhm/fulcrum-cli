// @ts-nocheck

import List from './actions/list';
import Find from './actions/find';
import Create from './actions/create';
import Delete from './actions/delete';
import Resource from './resource';
import applyMixins from '../utils/mixin';

export default class Export extends Resource {
  get resourceName() {
    return 'export';
  }

  get resourcesName() {
    return 'exports';
  }
}

interface Export extends List, Find, Create, Delete {}
applyMixins(Export, [List, Find, Create, Delete]);
