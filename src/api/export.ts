// @ts-nocheck

import List from './actions/list';
import Find from './actions/find';
import Create from './actions/create';
import Delete from './actions/delete';
import Resource from './resource';

export default class Export extends Resource {
  get resourceName() {
    return 'export';
  }

  get resourcesName() {
    return 'exports';
  }
}

List.includeInto(Export);
Find.includeInto(Export);
Create.includeInto(Export);
Delete.includeInto(Export);
