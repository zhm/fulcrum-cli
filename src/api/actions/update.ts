// @ts-nocheck

import Mixin from 'mixmatch';

export default class Update extends Mixin {
  async update(id, object) {
    const options = {
      method: 'PUT',
      path: this.member(id),
      body: this.attributesForObject(object),
    };

    const body = await this.call(options);

    return JSON.parse(body)[this.resourceName];
  }
}
