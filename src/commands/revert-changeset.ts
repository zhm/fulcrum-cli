import { CommandBuilder } from 'yargs';
import { createClient } from '../shared/api';
import revertChangeset from '../shared/revert-changeset';
import { CommandArguments, CommandHandler, defineCommand } from './command';

interface Arguments extends CommandArguments {
  changeset: string;
}

export const command = 'revert-changeset';
export const description = 'Revert a changeset';
export const builder: CommandBuilder = (yargs) => yargs
  .option('changeset', {
    required: true,
    alias: 'c',
    type: 'string',
    description: 'Changeset ID',
  })
  .strict(false);

export const handler: CommandHandler<Arguments> = async ({
  endpoint, token, changeset: changesetID,
}) => {
  const client = createClient(endpoint, token);

  await revertChangeset(client, changesetID);
};

export default defineCommand({
  command,
  description,
  builder,
  handler,
});
