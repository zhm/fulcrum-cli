import { createClient } from '../shared/api';
import restoreForm from '../shared/restore-form';

const command = 'restore-form';
const description = 'Restore form and records';
const builder = (yargs) => {
  yargs
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
};

const handler = async ({
  endpoint, token, form: formID, date,
}) => {
  const client = createClient(endpoint, token);

  await restoreForm(client, formID, date);
};

export default {
  command,
  description,
  builder,
  handler,
};
