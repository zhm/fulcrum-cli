import { CommandBuilder } from 'yargs';
import { createClient } from '../../shared/api';
import { CommandArguments, CommandHandler, defineCommand } from '../command';
import duplicateForm, { fetchForm } from '../../shared/forms';

interface Arguments extends CommandArguments {
  form: string;
  records: boolean;
}

const command = 'duplicate';

const description = 'Duplicate form and records';

const builder: CommandBuilder = (yargs) => yargs
  .option('form', {
    required: true,
    alias: 'f',
    type: 'string',
    description: 'Form ID to duplicate',
  })
  .option('records', {
    required: true,
    alias: 'r',
    type: 'boolean',
    default: true,
    description: 'Duplicate records after duplicating the form',
  })
  .strict(false);

const handler: CommandHandler<Arguments> = async ({
  endpoint, token, form: formID, records,
}) => {
  const client = createClient(endpoint, token);

  const form = await fetchForm(client, formID);

  await duplicateForm(client, form, records);
};

export default defineCommand({
  command,
  description,
  builder,
  handler,
});
