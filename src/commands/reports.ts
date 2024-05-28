import { CommandBuilder } from 'yargs';
import { defineCommand } from './command';
import runReport from './reports/run';

const command = 'reports';

const description = 'Reports';

const builder: CommandBuilder = (yargs) => yargs
  .command(runReport)
  .demand(1, 'must provide a valid command')
  .strict(false);

export default defineCommand({
  command,
  description,
  builder,
});
