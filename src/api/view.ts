// @ts-nocheck

import List from './actions/list';
import Find from './actions/find';
import Create from './actions/create';
import Delete from './actions/delete';
import Update from './actions/update';
import Resource from './resource';

export default class View extends Resource {
  get resourceName() {
    return 'view';
  }

  get resourcesName() {
    return 'views';
  }
}

List.includeInto(View);
Find.includeInto(View);
Create.includeInto(View);
Update.includeInto(View);
Delete.includeInto(View);
