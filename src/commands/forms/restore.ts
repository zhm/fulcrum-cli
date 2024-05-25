import { CommandBuilder } from 'yargs';
import { createClient } from '../../shared/api';
import { CommandArguments, CommandHandler, defineCommand } from '../command';
import { restoreForm } from '../../shared/forms';

interface Arguments extends CommandArguments {
  form: string;
  date: string;
}

const command = 'restore';

const description = 'Restore form and records';

const builder: CommandBuilder = (yargs) => yargs
  .option('form', {
    required: true,
    alias: 'f',
    type: 'string',
    description: 'Deleted Form ID',
  })
  .option('date', {
    required: true,
    alias: 'd',
    type: 'string',
    description: 'Date when form was deleted as ISO 8601. e.g. 2024-04-26T17:36:33Z',
  })
  .strict(false);

const handler: CommandHandler<Arguments> = async ({
  endpoint, token, form: formID, date,
}) => {
  const client = createClient(endpoint, token);

  await restoreForm(client, formID, date);
};

export default defineCommand({
  command,
  description,
  builder,
  handler,
});
