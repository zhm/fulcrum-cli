import {
  createClient,
  fetchForm,
  fetchRecordsBySQL,
  deleteRecords,
} from '../shared/api';

const command = 'delete-records';
const description = 'Delete records';
const builder = (yargs) => {
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
    .option('comment', {
      type: 'string',
      description: 'Comment',
    })
    .strict(false);
};

const handler = async ({
  endpoint, token, sql, form: formID, comment, where,
}) => {
  const client = createClient(endpoint, token);

  const form = await fetchForm(client, formID);

  const records = await fetchRecordsBySQL(client, form, sql ?? `select * from "${formID}"`, where);

  await deleteRecords(client, form, records, comment ?? 'Delete records');
};

export default {
  command,
  description,
  builder,
  handler,
};
