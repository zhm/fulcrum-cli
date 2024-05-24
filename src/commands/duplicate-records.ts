import { CommandBuilder } from 'yargs';
import { createClient } from '../shared/api';
import duplicateRecords from '../shared/duplicate-records';
import { CommandArguments, CommandHandler, defineCommand } from './command';

interface Arguments extends CommandArguments {
  source: string;
  destination: string;
  sql: string;
  where: string;
}

const command = 'duplicate-records';
const description = 'Duplicate records into new app';
const builder: CommandBuilder = (yargs) => yargs
  .option('source', {
    required: true,
    alias: 's',
    type: 'string',
    description: 'Form ID to pull records from',
  })
  .option('destination', {
    required: true,
    alias: 'd',
    type: 'string',
    description: 'Form ID to add records to',
  })
  .option('sql', {
    alias: 'sql',
    type: 'string',
    description: 'SQL query',
  })
  .option('where', {
    alias: 'w',
    type: 'string',
    default: '',
    description: 'SQL where clause',
  })
  .strict(false);

const handler: CommandHandler<Arguments> = async ({
  endpoint, token, source, destination, sql, where,
}) => {
  const client = createClient(endpoint, token);

  await duplicateRecords(client, source, destination, sql, where);
};

export default defineCommand({
  command,
  description,
  builder,
  handler,
});
