import request from 'request';
import Client from '../api/client';

export const command = 'query';
export const description = 'Test';
export const builder = (yargs) => {
  yargs
    .option('sql', {
      required: true,
      alias: 'sql',
      type: 'string',
      description: 'SQL query',
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

export const handler = async ({ endpoint, token, sql }) => {
  const client = createClient(endpoint, token);

  const results = await client.query.run({ q: sql });

  console.log(JSON.stringify(results.objects));
};
