import { CommandBuilder } from 'yargs';
import {
  createClient,
  fetchForm,
  fetchRecordsBySQL,
  deleteRecords,
} from '../shared/api';
import { CommandArguments, CommandHandler, defineCommand } from './command';

interface Arguments extends CommandArguments {
  sql: string;
  where: string;
  form: string;
  comment: string;
}

const command = 'delete-records';
const description = 'Delete records';
const builder: CommandBuilder = (yargs) => yargs
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

const handler: CommandHandler<Arguments> = async ({
  endpoint, token, sql, form: formID, comment, where,
}) => {
  const client = createClient(endpoint, token);

  const form = await fetchForm(client, formID);

  const records = await fetchRecordsBySQL(client, form, sql ?? `select * from "${formID}"`, where);

  await deleteRecords(client, form, records, comment ?? 'Delete records');
};

export default defineCommand({
  command,
  description,
  builder,
  handler,
});
