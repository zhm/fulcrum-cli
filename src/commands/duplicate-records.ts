import { CommandBuilder } from 'yargs';
import { createClient } from '../shared/api';
import duplicateRecords from '../shared/duplicate-records';
import { CommandArguments, CommandHandler, defineCommand } from './command';

interface Arguments extends CommandArguments {
  source: string;
  destination: string;
}

const command = 'duplicate-records';
const description = 'Duplicate records into new app';
const builder = (yargs) => {
  yargs
    .option('origin', {
      required: true,
      alias: 'o',
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
    .strict(false);
};

const handler = async ({
  endpoint, token, origin, destination, sql,
}) => {
  const client = createClient(endpoint, token);

  await duplicateRecords(client, origin, destination, sql);
};

export default defineCommand({
  command,
  description,
  builder,
  handler,
});
