// @ts-nocheck

import List from './actions/list';
import Find from './actions/find';
import Create from './actions/create';
import Update from './actions/update';
import Delete from './actions/delete';
import Resource from './resource';
import applyMixins from '../utils/mixin';

export default class Workflow extends Resource {
  get resourceName() {
    return 'workflow';
  }

  get resourcesName() {
    return 'workflows';
  }
}

interface Workflow extends List, Find, Create, Update, Delete {}
applyMixins(Workflow, [List, Find, Create, Update, Delete]);
