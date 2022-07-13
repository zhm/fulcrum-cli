import axios from 'axios';
import { Form, Record } from 'fulcrum-core';
import Client from '../api/client';

export function createClient(endpoint: string, token: string) {
  return new Client({
    base: `${endpoint}/api/v2`,
    config: {
      query_url: endpoint,
    },
    token,
    request: axios,
    userAgent: 'Fulcrum CLI',
  });
}

export async function fetchForm(client: Client, id: string) {
  return new Form(await client.forms.find(id));
}

export async function fetchRecordsBySQL(client: Client, form: Form, sql: string) {
  const result = await client.query.run({ q: sql });

  const ids = result.objects.map((o) => o._record_id ?? o.record_id ?? o.id);

  const records = [];

  for (const id of ids) {
    // eslint-disable-next-line no-await-in-loop
    records.push(new Record(await client.records.find(id), form));
  }

  return records;
}
