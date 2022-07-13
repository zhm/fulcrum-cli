import {
  createClient, fetchForm, fetchRecordsBySQL, updateCalculatedFields,
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

  const form = await fetchForm(client, formID);

  const records = await fetchRecordsBySQL(client, form, sql);

  await updateCalculatedFields(records[0]);

  // console.log('RECORDS', records.length);
  // console.log(form.elementsOfType('CalculatedField').length);
  // console.log(JSON.stringify(results.objects));
};
