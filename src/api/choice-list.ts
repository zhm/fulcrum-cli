// @ts-nocheck

import List from './actions/list';
import Find from './actions/find';
import Create from './actions/create';
import Update from './actions/update';
import Delete from './actions/delete';
import Resource from './resource';
import applyMixins from '../utils/mixin';

export default class ChoiceList extends Resource {
  get resourceName() {
    return 'choice_list';
  }

  get resourcesName() {
    return 'choice_lists';
  }
}

interface ChoiceList extends List, Find, Create, Update, Delete {}
applyMixins(ChoiceList, [List, Find, Create, Update, Delete]);
