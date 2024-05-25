import { CommandBuilder } from 'yargs';
import { createClient } from '../../shared/api';
import { CommandArguments, CommandHandler, defineCommand } from '../command';
import { createAttachment, deleteAttachmentsByName } from '../../shared/attachments';

interface Arguments extends CommandArguments {
  form: string;
  file: string;
  name: string;
}

const command = 'upload-reference-file';

const description = 'Upload a Reference File';

const builder: CommandBuilder = (yargs) => yargs
  .option('form', {
    required: true,
    alias: 'f',
    type: 'string',
    description: 'Form ID to upload the file to',
  })
  .option('file', {
    required: true,
    type: 'string',
    description: 'The path to the file',
  })
  .option('name', {
    required: true,
    alias: 'n',
    type: 'string',
    description: 'The name of the file',
  })
  .strict(false);

const handler: CommandHandler<Arguments> = async ({
  endpoint, token, form: formID, file, name,
}) => {
  const client = createClient(endpoint, token);

  await deleteAttachmentsByName(client, formID, name);

  await createAttachment(client, formID, file, name);
};

export default defineCommand({
  command,
  description,
  builder,
  handler,
});
