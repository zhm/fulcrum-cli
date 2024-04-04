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
    .option('where', {
      alias: 'w',
      type: 'string',
      default: '',
      description: 'SQL where clause',
    })
    .option('form', {
      required: true,
      alias: 'f',
      type: 'string',
      description: 'Form ID',
    })
    .option('field', {
      type: 'array',
      description: 'Field data name',
    })
    .option('value', {
      type: 'array',
      description: 'Field value',
    })
    .option('comment', {
      type: 'string',
      description: 'Comment',
    })
    .option('script', {
      type: 'string',
      description: 'Script file to execute',
    })
    .strict(false);
};

export const handler = async ({
  endpoint, token, sql, form: formID, comment, field, value, where, script,
}) => {
  const client = createClient(endpoint, token);

  const context = await fetchContext(client);

  const form = await fetchForm(client, formID);

  const records = await fetchRecordsBySQL(client, form, sql ?? `select * from "${formID}"`, where);

  if (field && field.length !== value.length) {
    console.error('Must pass the same number of fields and values');
    return;
  }

  const results = [];

  if (script) {
    const mod = require(script);

    for (const record of records) {
      const result = await mod.processRecord(record);

      if (result) {
        results.push(result);
      }
    }
  }

  await updateRecordFields(
    client,
    form,
    results,
    context,
    field ?? [],
    value ?? [],
    comment ?? 'Updating records',
  );
};

export default {
  command,
  description,
  builder,
  handler,
};
