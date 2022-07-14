// @ts-nocheck

import Mixin from 'mixmatch';

export default class Update extends Mixin {
  async update(id, object) {
    const options = {
      method: 'PUT',
      path: this.member(id),
      data: this.attributesForObject(object),
    };

    const json = await this.call(options);

    return json[this.resourceName];
  }
}
