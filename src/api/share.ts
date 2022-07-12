// @ts-nocheck

import List from './actions/list';
import Find from './actions/find';
import Create from './actions/create';
import Delete from './actions/delete';
import Resource from './resource';

export default class Share extends Resource {
  get resourceName() {
    return 'share';
  }

  get resourcesName() {
    return 'shares';
  }
}

List.includeInto(Share);
Find.includeInto(Share);
Create.includeInto(Share);
Delete.includeInto(Share);
