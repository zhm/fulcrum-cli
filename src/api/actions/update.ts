// @ts-nocheck

export default class Update {
  async update(id, object) {
    const options = {
      method: 'PUT',
      path: this.member(id),
      data: this.attributesForObject(object),
      headers: {
        'x-skipworkflows': true,
        'x-skipwebhooks': true,
      },
    };

    const json = await this.call(options);

    return json[this.resourceName];
  }
}
