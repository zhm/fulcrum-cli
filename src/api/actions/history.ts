// @ts-nocheck

import Mixin from 'mixmatch';

export default class History extends Mixin {
  async history(id: string, params = {}) {
    const options = {
      method: 'GET',
      path: this.memberAction(id, 'history'),
      qs: params,
    };

    const body = await this.call(options);

    return JSON.parse(body)[this.resourcesName];
  }
}
