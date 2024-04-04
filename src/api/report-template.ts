// @ts-nocheck

import List from './actions/list';
import Find from './actions/find';
import Create from './actions/create';
import Update from './actions/update';
import Delete from './actions/delete';
import Resource from './resource';
import applyMixins from '../utils/mixin';

export default class ReportTemplate extends Resource {
  get resourceName() {
    return 'report_template';
  }

  get resourcesName() {
    return 'report_templates';
  }
}

interface ReportTemplate extends List, Find, Create, Update, Delete {}
applyMixins(ReportTemplate, [List, Find, Create, Update, Delete]);
