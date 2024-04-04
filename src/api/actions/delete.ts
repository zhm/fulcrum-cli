// @ts-nocheck

export default class Delete {
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
