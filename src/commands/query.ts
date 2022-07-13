import { createClient } from '../shared/api';

export const command = 'query';
export const description = 'Run query';
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

export const handler = async ({ endpoint, token, sql }) => {
  const client = createClient(endpoint, token);

  const results = await client.query.run({ q: sql });

  console.log(JSON.stringify(results.objects));
};
