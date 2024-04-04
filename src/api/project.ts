// @ts-nocheck

import List from './actions/list';
import Find from './actions/find';
import Resource from './resource';
import applyMixins from '../utils/mixin';

export default class Project extends Resource {
  get resourceName() {
    return 'project';
  }

  get resourcesName() {
    return 'projects';
  }
}

interface Project extends List, Find {}
applyMixins(Project, [List, Find]);
