// @ts-nocheck

import Mixin from 'mixmatch';

export default class Delete extends Mixin {
  async delete(id, object) {
    const options = {
      method: 'DELETE',
      path: this.member(id),
      body: this.attributesForObject(object),
    };

    const body = await this.call(options);

    return JSON.parse(body)[this.resourceName];
  }
}
