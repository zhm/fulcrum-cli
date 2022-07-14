// @ts-nocheck

import Resource from './resource';

export default class User extends Resource {
  get resourceName() {
    return 'user';
  }

  get resourcesName() {
    return 'users';
  }

  async find() {
    const json = await this.client.get({ path: this.collection() });

    return json[this.resourceName];
  }
}
