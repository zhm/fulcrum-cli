import { stringify } from 'csv-stringify/sync';
import { Argv, CommandBuilder } from 'yargs';
import { createClient } from '../../shared/api';
import { CommandArguments, CommandHandler, defineCommand } from '../command';

interface Arguments extends CommandArguments {
  sql: string;
  format: 'json' | 'csv';
}

const command = 'run';

const description = 'Run query';

const builder: CommandBuilder = (yargs): Argv => yargs
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
    choices: ['json', 'csv'],
    description: 'Format, json or csv',
  })
  .strict(false);

const handler: CommandHandler<Arguments> = async ({
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

export default defineCommand({
  command,
  description,
  builder,
  handler,
});
