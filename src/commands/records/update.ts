import { CommandBuilder } from 'yargs';
import {
  createClient,
  fetchContext,
} from '../../shared/api';
import { CommandArguments, CommandHandler, defineCommand } from '../command';
import { fetchRecordsBySQL, updateRecordFields } from '../../shared/records';
import { fetchForm } from '../../shared/forms';
import { log } from '../../utils/logger';

interface Arguments extends CommandArguments {
  sql: string;
  where: string;
  form: string;
  field: string[];
  value: string[];
  comment: string;
  script: string;
}

export const command = 'update';

export const description = 'Update records';

export const builder: CommandBuilder = (yargs) => yargs
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
  .strict(false);

export const handler: CommandHandler<Arguments> = async ({
  endpoint, token, sql, form: formID, comment, field, value, where, script,
}) => {
  const client = createClient(endpoint, token);

  const context = await fetchContext(client);

  const form = await fetchForm(client, formID);

  const records = await fetchRecordsBySQL(client, form, sql, where);

  if (field && field.length !== value.length) {
    log.error('Must pass the same number of fields and values');
    return;
  }

  await updateRecordFields(
    client,
    form,
    records,
    context,
    field ?? [],
    value ?? [],
    comment ?? 'Updating records',
  );
};

export default defineCommand({
  command,
  description,
  builder,
  handler,
});
