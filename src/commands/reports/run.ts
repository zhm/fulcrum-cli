import { CommandBuilder } from 'yargs';
import { createClient } from '../../shared/api';
import { CommandArguments, CommandHandler, defineCommand } from '../command';
import { fetchForm } from '../../shared/forms';
import { fetchRecordsBySQL } from '../../shared/records';
import { runReports } from '../../shared/reports';

interface Arguments extends CommandArguments {
  sql: string;
  where: string;
  form: string;
  report: string;
  output: string;
}

const command = 'run';

const description = 'Run reports';

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
  .option('report', {
    type: 'string',
    description: 'Report ID',
  })
  .option('output', {
    type: 'string',
    alias: 'o',
    required: true,
    description: 'Output directory',
  })
  .strict(false);

const handler: CommandHandler<Arguments> = async ({
  endpoint, token, sql, where, form: formID, report: reportID, output,
}) => {
  const client = createClient(endpoint, token);

  const form = await fetchForm(client, formID);

  const records = await fetchRecordsBySQL(client, form, sql, where);

  await runReports(client, records, reportID, output);
};

export default defineCommand({
  command,
  description,
  builder,
  handler,
});
