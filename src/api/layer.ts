// @ts-nocheck

import List from './actions/list';
import Find from './actions/find';
import Resource from './resource';

export default class Layer extends Resource {
  get resourceName() {
    return 'layer';
  }

  get resourcesName() {
    return 'layers';
  }
}

List.includeInto(Layer);
Find.includeInto(Layer);
