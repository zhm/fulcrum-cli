// @ts-nocheck

import Mixin from 'mixmatch';

export default class Find extends Mixin {
  async find(id, params = {}) {
    const options = {
      method: 'GET',
      path: this.member(id),
      params,
    };

    const json = await this.call(options);

    return json[this.resourceName];
  }
}
