// @ts-nocheck

import Page from '../page';

const DEFAULT_PER_PAGE = 1000;

export default class List {
  get defaultListParams() {
    return { per_page: DEFAULT_PER_PAGE };
  }

  async all(params) {
    const options = {
      method: 'GET',
      path: this.collection(),
      params: params || this.defaultListParams,
    };

    const json = await this.call(options);

    return new Page(json, this.resourcesName);
  }
}
