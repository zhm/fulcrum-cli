import { CommandBuilder } from 'yargs';
import { createClient } from '../../shared/api';
import { CommandArguments, CommandHandler, defineCommand } from '../command';
import { fetchRecord } from '../../shared/records';

interface Arguments extends CommandArguments {
  record: string;
  friendly: boolean;
}

export const command = 'show';

export const description = 'Show record';

export const builder: CommandBuilder = (yargs) => yargs
  .option('record', {
    type: 'string',
    required: true,
    description: 'Record ID',
  })
  .option('friendly', {
    type: 'boolean',
    required: true,
    default: false,
    description: 'Show the form values in a friendly format',
  })
  .strict(false);

export const handler: CommandHandler<Arguments> = async ({
  endpoint, token, record: recordID, friendly,
}) => {
  const client = createClient(endpoint, token);

  const record = await fetchRecord(client, recordID);

  console.log(record.toJSON({ simple: friendly }));
};

export default defineCommand({
  command,
  description,
  builder,
  handler,
});
