// @ts-nocheck

export default class Update {
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
