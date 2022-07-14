import {
  createClient, fetchForm, fetchRecordsBySQL, updateCalculatedFields, fetchContext, saveRecords,
  shutdownSandbox,
} from '../shared/api';

export const command = 'update-calculations';
export const description = 'Update calculation fields';
export const builder = (yargs) => {
  yargs
    .option('sql', {
      required: true,
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
    .strict(false);
};

export const handler = async ({
  endpoint, token, sql, form: formID,
}) => {
  const client = createClient(endpoint, token);

  const context = await fetchContext(client);

  const form = await fetchForm(client, formID);

  const records = await fetchRecordsBySQL(client, form, sql);

  for (const record of records) {
    await updateCalculatedFields(record, context);
  }

  await saveRecords(client, form, records, 'Updating calculations');

  await shutdownSandbox();
};
