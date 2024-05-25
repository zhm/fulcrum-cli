import { CommandBuilder } from 'yargs';
import { defineCommand } from './command';
import query from './query/run';

const command = 'query';

const description = 'Query';

const builder: CommandBuilder = (yargs) => yargs
  .command(query)
  .demand(1, 'must provide a valid command')
  .strict(false);

export default defineCommand({
  command,
  description,
  builder,
});
