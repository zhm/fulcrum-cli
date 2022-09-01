import {
  createClient,
  fetchForm,
  fetchRecordsBySQL,
  fetchContext,
  saveRecords,
  batch,
} from '../shared/api';
import { updateCalculations, shutdownSandbox } from '../shared/update-calculations';

export const command = 'update-calculations';
export const description = 'Update calculation fields';
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
    .option('comment', {
      type: 'string',
      description: 'Comment',
    })
    .strict(false);
};

export const handler = async ({
  endpoint, token, sql, form: formID, comment,
}) => {
  const client = createClient(endpoint, token);

  const context = await fetchContext(client);

  const form = await fetchForm(client, formID);

  const records = await fetchRecordsBySQL(client, form, sql ?? `select * from "${formID}"`);

  await batch(records, (record) => updateCalculations(record, context));

  await saveRecords(client, form, records, comment ?? 'Updating calculations');

  await shutdownSandbox();
};
