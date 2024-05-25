import { CommandBuilder } from 'yargs';
import { createClient } from '../../shared/api';
import { CommandArguments, CommandHandler, defineCommand } from '../command';
import { fetchChangeset } from '../../shared/changesets';

interface Arguments extends CommandArguments {
  changeset: string;
}

export const command = 'show';

export const description = 'Show a changeset';

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

  const changeset = await fetchChangeset(client, changesetID);

  console.log(changeset);
};

export default defineCommand({
  command,
  description,
  builder,
  handler,
});
