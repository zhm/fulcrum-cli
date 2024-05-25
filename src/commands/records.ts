import { CommandBuilder } from 'yargs';
import { defineCommand } from './command';
import deleteRecords from './records/delete';
import updateRecords from './records/update';
import duplicateRecords from './records/duplicate';

const command = 'records';

const description = 'Records';

const builder: CommandBuilder = (yargs) => yargs
  .command(deleteRecords)
  .command(updateRecords)
  .command(duplicateRecords)
  .demand(1, 'must provide a valid command')
  .strict(false);

export default defineCommand({
  command,
  description,
  builder,
});
