// @ts-nocheck

import List from './actions/list';
import Find from './actions/find';
import Create from './actions/create';
import Update from './actions/update';
import Delete from './actions/delete';
import Resource from './resource';

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

List.includeInto(Form);
Find.includeInto(Form);
Create.includeInto(Form);
Update.includeInto(Form);
Delete.includeInto(Form);
