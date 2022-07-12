import request from 'request';
import { Form, Record } from 'fulcrum-core';
import Client from '../api/client';

export const command = 'update-calculations';
export const description = 'Update calculation fields';
export const builder = (yargs) => {
  yargs
    .option('sql', {
      required: true,
      alias: 'sql',
      type: 'string',
      description: 'SQL query',
    })
    .option('form', {
      required: true,
      alias: 'f',
      type: 'string',
      description: 'Form ID',
    })
    .strict(false);
};

const createClient = (endpoint, token) => {
  const client = new Client({
    base: `${endpoint}/api/v2`,
    config: {
      query_url: endpoint,
    },
    token,
    request,
    userAgent: 'Fulcrum CLI',
  });

  return client;
};

export const handler = async ({
  endpoint, token, sql, form: formID,
}) => {
  const client = createClient(endpoint, token);

  const form = new Form(await client.forms.find(formID));

  const result = await client.query.run({ q: sql });

  const ids = result.objects.map((o) => o._record_id ?? o.record_id ?? o.id);

  const records = [];

  for (const id of ids) {
    records.push(new Record(await client.records.find(id), form));
  }

  console.log(JSON.stringify(records.map((o) => o.toJSON())));
  // console.log(JSON.stringify(results.objects));
};
