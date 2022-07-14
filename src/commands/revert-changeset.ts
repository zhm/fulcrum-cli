import {
  createClient, revertChangeset,
} from '../shared/api';

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
