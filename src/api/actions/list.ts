// @ts-nocheck

import Mixin from 'mixmatch';
import Page from '../page';

const DEFAULT_PER_PAGE = 1000;

export default class List extends Mixin {
  get defaultListParams() {
    return { per_page: DEFAULT_PER_PAGE };
  }

  async all(params) {
    const options = {
      method: 'GET',
      path: this.collection(),
      qs: params || this.defaultListParams,
    };

    const body = await this.call(options);

    return new Page(JSON.parse(body), this.resourcesName);
  }
}
