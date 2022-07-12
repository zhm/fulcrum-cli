// @ts-nocheck

import Resource from './resource';
import Page from './page';

export default class Query extends Resource {
  async ast(params) {
    const options = {
      url: `${this.client.config.query_url}/api/v2/query`,
      qs: {
        ...params, ast: true, format: 'json', token: this.client.token,
      },
    };

    const body = await this.client.call(options);

    return JSON.parse(body);
  }

  async run(params) {
    const options = {
      url: `${this.client.config.query_url}/api/v2/query`,
      qs: {
        ...params, arrays: 1, format: 'json', token: this.client.token,
      },
    };

    const body = await this.client.call(options);

    const parsed = JSON.parse(body);

    const objects = [];

    for (const row of parsed.rows) {
      const object = {};
      const { fields } = parsed;

      for (let i = 0; i < fields.length; ++i) {
        object[fields[i].name] = row[i];
      }

      objects.push(object);
    }

    parsed.objects = objects;

    const page = new Page(parsed, 'objects');

    page.fields = parsed.fields;
    page.columns = parsed.columns;

    return page;
  }

  async queryRecords({ q }) {
    const data = await this.run({ q });

    for (const object of data.objects) {
      if (object.hasOwnProperty('form_values')) {
        object.form_values = JSON.parse(object.form_values);
      }
    }

    return data.objects;
  }
}
