// @ts-nocheck

import Mixin from 'mixmatch';

export default class History extends Mixin {
  async history(id: string, params = {}) {
    const options = {
      method: 'GET',
      path: this.memberAction(id, 'history'),
      params,
    };

    const json = await this.call(options);

    return json[this.resourcesName];
  }
}
