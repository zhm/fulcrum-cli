import { CommandBuilder } from 'yargs';
import { createClient } from '../../shared/api';
import { CommandArguments, CommandHandler, defineCommand } from '../command';
import duplicateRecords from '../../shared/records';
import { fetchForm } from '../../shared/forms';

interface Arguments extends CommandArguments {
  source: string;
  destination: string;
  sql: string;
  where: string;
}

const command = 'duplicate';

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

  const sourceForm = await fetchForm(client, source);
  const destinationForm = await fetchForm(client, destination);

  await duplicateRecords(client, sourceForm, destinationForm, sql, where);
};

export default defineCommand({
  command,
  description,
  builder,
  handler,
});
