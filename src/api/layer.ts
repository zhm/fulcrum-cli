// @ts-nocheck

import List from './actions/list';
import Find from './actions/find';
import Resource from './resource';
import applyMixins from '../utils/mixin';

export default class Layer extends Resource {
  get resourceName() {
    return 'layer';
  }

  get resourcesName() {
    return 'layers';
  }
}

interface Layer extends List, Find {}
applyMixins(Layer, [List, Find]);
