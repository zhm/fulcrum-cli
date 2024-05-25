import { CommandBuilder } from 'yargs';
import { defineCommand } from './command';
import showChangeset from './changesets/show';
import revertChangeset from './changesets/revert';

const command = 'changesets';

const description = 'Changesets';

const builder: CommandBuilder = (yargs) => yargs
  .command(showChangeset)
  .command(revertChangeset)
  .demand(1, 'must provide a valid command')
  .strict(false);

export default defineCommand({
  command,
  description,
  builder,
});
