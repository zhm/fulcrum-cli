import { CommandBuilder } from 'yargs';
import fs from 'fs';
import {
  createClient,
  fetchContext,
} from '../../shared/api';
import { CommandArguments, CommandHandler, defineCommand } from '../command';
import { fetchRecordsBySQL, restoreRecords, updateRecordFields } from '../../shared/records';
import { fetchForm } from '../../shared/forms';
import { log } from '../../utils/logger';

interface Arguments extends CommandArguments {
  idFile: string;
  form: string;
  comment: string;
}

export const command = 'restore';

export const description = 'Restore deleted records';

export const builder: CommandBuilder = (yargs) => yargs
  .option('idFile', {
    type: 'string',
    default: '',
    description: 'File containing record IDs',
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
  endpoint, token, idFile, form: formID, comment,
}) => {
  const client = createClient(endpoint, token);

  const form = await fetchForm(client, formID);

  const ids = (await fs.promises.readFile(idFile, 'utf-8')).trim().split('\n').map((id) => id.trim());

  await restoreRecords(client, form, ids);
};

export default defineCommand({
  command,
  description,
  builder,
  handler,
});
