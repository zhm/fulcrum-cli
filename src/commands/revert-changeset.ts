import { createClient } from '../shared/api';
import revertChangeset from '../shared/revert-changeset';

export const command = 'revert-changeset';
export const description = 'Revert a changeset';
export const builder = (yargs) => {
  yargs
    .option('changesetId', {
      type: 'string',
      description: 'Changeset ID',
    })
    .strict(false);
};

export const handler = async ({
  endpoint, token, changesetId,
}) => {
  const client = createClient(endpoint, token);

  await revertChangeset(client, changesetId);
};

export default {
  command,
  description,
  builder,
  handler,
};
