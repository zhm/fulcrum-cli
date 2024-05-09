import { createClient } from '../shared/api';
import duplicateRecords from '../shared/duplicate-records';

const command = 'duplicate-records';
const description = 'Duplicate records into new app';
const builder = (yargs) => {
  yargs
    .option('origin', {
      required: true,
      alias: 'o',
      type: 'string',
      description: 'Form ID to pull records from',
    })
    .option('destination', {
      required: true,
      alias: 'd',
      type: 'string',
      description: 'Form ID to add records to',
    })
    .strict(false);
};

const handler = async ({
  endpoint, token, origin, destination,
}) => {
  const client = createClient(endpoint, token);

  await duplicateRecords(client, origin, destination);
};

export default {
  command,
  description,
  builder,
  handler,
};
