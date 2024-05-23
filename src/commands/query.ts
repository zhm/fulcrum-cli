import { stringify } from 'csv-stringify/sync';
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
    .option('format', {
      required: true,
      default: 'json',
      alias: 'f',
      type: 'string',
      description: 'Format, json or csv',
    })
    .strict(false);
};

export const handler = async ({
  endpoint, token, sql, format,
}) => {
  const client = createClient(endpoint, token);

  const results = await client.query.run({ q: sql });

  process.stdout.write(
    format === 'json'
      ? JSON.stringify(results.objects)
      : stringify(results.objects, { header: true }),
  );
};

export default {
  command,
  description,
  builder,
  handler,
};
