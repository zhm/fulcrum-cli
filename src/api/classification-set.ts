// @ts-nocheck

import List from './actions/list';
import Find from './actions/find';
import Create from './actions/create';
import Update from './actions/update';
import Delete from './actions/delete';
import Resource from './resource';
import applyMixins from '../utils/mixin';

export default class ClassificationSet extends Resource {
  get resourceName() {
    return 'classification_set';
  }

  get resourcesName() {
    return 'classification_sets';
  }
}

interface ClassificationSet extends List, Find, Create, Update, Delete {}
applyMixins(ClassificationSet, [List, Find, Create, Update, Delete]);
