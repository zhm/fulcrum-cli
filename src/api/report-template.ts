// @ts-nocheck

import List from './actions/list';
import Find from './actions/find';
import Create from './actions/create';
import Update from './actions/update';
import Delete from './actions/delete';
import Resource from './resource';

export default class ReportTemplate extends Resource {
  get resourceName() {
    return 'report_template';
  }

  get resourcesName() {
    return 'report_templates';
  }
}

List.includeInto(ReportTemplate);
Find.includeInto(ReportTemplate);
Create.includeInto(ReportTemplate);
Update.includeInto(ReportTemplate);
Delete.includeInto(ReportTemplate);
