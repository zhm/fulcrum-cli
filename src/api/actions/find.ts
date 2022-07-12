// @ts-nocheck

import Mixin from 'mixmatch';

export default class Find extends Mixin {
  async find(id, params = {}) {
    const options = {
      method: 'GET',
      path: this.member(id),
      qs: params,
    };

    const body = await this.call(options);

    return JSON.parse(body)[this.resourceName];
  }
}
