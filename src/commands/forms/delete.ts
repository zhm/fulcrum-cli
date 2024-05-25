import { CommandBuilder } from 'yargs';
import { createClient } from '../../shared/api';
import { CommandArguments, CommandHandler, defineCommand } from '../command';
import { deleteForm, fetchForm } from '../../shared/forms';

interface Arguments extends CommandArguments {
  form: string;
}

const command = 'delete';

const description = 'Delete form';

const builder: CommandBuilder = (yargs) => yargs
  .option('form', {
    required: true,
    alias: 'f',
    type: 'string',
    description: 'Form ID',
  })
  .strict(false);

const handler: CommandHandler<Arguments> = async ({
  endpoint, token, form: formID,
}) => {
  const client = createClient(endpoint, token);

  const form = await fetchForm(client, formID);

  await deleteForm(client, form);
};

export default defineCommand({
  command,
  description,
  builder,
  handler,
});
