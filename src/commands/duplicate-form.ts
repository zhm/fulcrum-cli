import { CommandBuilder } from 'yargs';
import { createClient } from '../shared/api';
import duplicateForm from '../shared/duplicate-form';
import { CommandArguments, CommandHandler, defineCommand } from './command';

interface Arguments extends CommandArguments {
  form: string;
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
  .strict(false);

const handler: CommandHandler<Arguments> = async ({
  endpoint, token, form: formID,
}) => {
  const client = createClient(endpoint, token);

  await duplicateForm(client, formID);
};

export default defineCommand({
  command,
  description,
  builder,
  handler,
});
