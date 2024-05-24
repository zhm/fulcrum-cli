import { CommandBuilder } from 'yargs';
import {
  createClient,
  fetchForm,
  fetchRecordsBySQL,
  fetchContext,
  saveRecords,
  batch,
} from '../shared/api';
import { updateCalculations, shutdownSandbox } from '../shared/update-calculations';
import { CommandArguments, CommandHandler, defineCommand } from './command';

interface Arguments extends CommandArguments {
  sql: string;
  form: string;
  comment: string;
}

export const command = 'update-calculations';
export const description = 'Update calculation fields';
export const builder: CommandBuilder = (yargs) => yargs
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

export const handler: CommandHandler<Arguments> = async ({
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

export default defineCommand({
  command,
  description,
  builder,
  handler,
});
