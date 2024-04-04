// @ts-nocheck

import List from './actions/list';
import Find from './actions/find';
import Create from './actions/create';
import Delete from './actions/delete';
import Update from './actions/update';
import Resource from './resource';
import applyMixins from '../utils/mixin';

export default class View extends Resource {
  get resourceName() {
    return 'view';
  }

  get resourcesName() {
    return 'views';
  }
}

interface View extends List, Find, Create, Update, Delete {}
applyMixins(View, [List, Find, Create, Update, Delete]);
