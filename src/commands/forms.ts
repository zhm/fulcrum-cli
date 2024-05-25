import { CommandBuilder } from 'yargs';
import { defineCommand } from './command';
import restoreForm from './forms/restore';
import duplicateForm from './forms/duplicate';
import deleteForm from './forms/delete';
import uploadReferenceFile from './forms/upload-reference-file';

const command = 'forms';

const description = 'Forms';

const builder: CommandBuilder = (yargs) => yargs
  .command(deleteForm)
  .command(duplicateForm)
  .command(restoreForm)
  .command(uploadReferenceFile)
  .demand(1, 'must provide a valid command')
  .strict(false);

export default defineCommand({
  command,
  description,
  builder,
});
