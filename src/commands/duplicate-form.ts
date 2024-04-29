import { createClient } from '../shared/api';
import duplicateForm from '../shared/duplicate-form';

const command = 'duplicate-form';
const description = 'Duplicate form and records';
const builder = (yargs) => {
  yargs
    .option('form', {
      required: true,
      alias: 'f',
      type: 'string',
      description: 'Form ID to duplicate',
    })
    .strict(false);
};

const handler = async ({
  endpoint, token, form: formID,
}) => {
  const client = createClient(endpoint, token);

  await duplicateForm(client, formID);
};

export default {
  command,
  description,
  builder,
  handler,
};
