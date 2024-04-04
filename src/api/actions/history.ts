// @ts-nocheck

export default class History {
  async history(id: string, params = {}) {
    const options = {
      method: 'GET',
      path: this.memberAction(id, 'history'),
      params,
    };

    const json = await this.call(options);

    return json[this.resourcesName];
  }
}
