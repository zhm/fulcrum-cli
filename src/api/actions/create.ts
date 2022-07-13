// @ts-nocheck

import Mixin from 'mixmatch';

export default class Create extends Mixin {
  get createAction() {
    return this.collection();
  }

  async create(object) {
    const options = {
      method: 'POST',
      path: this.createAction,
      body: this.attributesForObject(object),
    };

    const json = await this.call(options);

    return json[this.resourceName];
  }
}
