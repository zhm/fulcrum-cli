import {
  createClient,
  fetchForm,
  fetchContext,
  fetchRecordsBySQL,
} from '../shared/api';
import { updateRecordFields } from '../shared/update-records';

export const command = 'update-records';
export const description = 'Update records';
export const builder = (yargs) => {
  yargs
    .option('sql', {
      alias: 'sql',
      type: 'string',
      description: 'SQL query',
    })
    .option('form', {
      required: true,
      alias: 'f',
      type: 'string',
      description: 'Form ID',
    })
    .option('field', {
      required: true,
      type: 'array',
      description: 'Field data name',
    })
    .option('value', {
      required: true,
      type: 'array',
      description: 'Field value',
    })
    .option('comment', {
      type: 'string',
      description: 'Comment',
    })
    .strict(false);
};

export const handler = async ({
  endpoint, token, sql, form: formID, comment, field, value, ...args
}) => {
  const client = createClient(endpoint, token);

  const context = await fetchContext(client);

  const form = await fetchForm(client, formID);

  const records = await fetchRecordsBySQL(client, form, sql ?? `select * from "${formID}"`);

  if (field.length !== value.length) {
    console.error('Must pass the same number of fields and values');
    return;
  }

  await updateRecordFields(
    client,
    form,
    records,
    context,
    field,
    value,
    comment ?? 'Updating records',
  );
};
