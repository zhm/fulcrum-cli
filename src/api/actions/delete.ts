// @ts-nocheck

import Mixin from 'mixmatch';

export default class Delete extends Mixin {
  async delete(id, object) {
    const options = {
      method: 'DELETE',
      path: this.member(id),
      data: this.attributesForObject(object),
    };

    const json = await this.call(options);

    return json[this.resourceName];
  }
}
