// @ts-nocheck

import List from './actions/list';
import Find from './actions/find';
import Create from './actions/create';
import Update from './actions/update';
import Delete from './actions/delete';
import Resource from './resource';

export default class Workflow extends Resource {
  get resourceName() {
    return 'workflow';
  }

  get resourcesName() {
    return 'workflows';
  }
}

List.includeInto(Workflow);
Find.includeInto(Workflow);
Create.includeInto(Workflow);
Update.includeInto(Workflow);
Delete.includeInto(Workflow);
