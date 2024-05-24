import { CommandBuilder } from 'yargs';
import { createClient } from '../shared/api';
import duplicateForm from '../shared/duplicate-form';
import { CommandArguments, CommandHandler, defineCommand } from './command';

interface Arguments extends CommandArguments {
  form: string;
  records: boolean;
}

const command = 'duplicate-form';
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

  await duplicateForm(client, formID, records);
};

export default defineCommand({
  command,
  description,
  builder,
  handler,
});
