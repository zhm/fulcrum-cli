// @ts-nocheck

export default class Find {
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
