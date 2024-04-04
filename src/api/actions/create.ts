// @ts-nocheck

export default class Create {
  get createAction() {
    return this.collection();
  }

  async create(object) {
    const options = {
      method: 'POST',
      path: this.createAction,
      data: this.attributesForObject(object),
    };

    const json = await this.call(options);

    return json[this.resourceName];
  }
}
