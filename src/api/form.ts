// @ts-nocheck

import List from './actions/list';
import Find from './actions/find';
import Create from './actions/create';
import Update from './actions/update';
import Delete from './actions/delete';
import Resource from './resource';
import applyMixins from '../utils/mixin';

export default class Form extends Resource {
  get resourceName() {
    return 'form';
  }

  get resourcesName() {
    return 'forms';
  }

  async systemApps() {
    const options = {
      method: 'GET',
      path: this.collectionAction('system_apps', null),
    };

    const json = await this.call(options);

    return json;
  }
}

interface Form extends List, Find, Create, Update, Delete {} // eslint-disable-line
applyMixins(Form, [List, Find, Create, Update, Delete]);
