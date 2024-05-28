import {
  ArgumentsCamelCase, CommandBuilder, CommandModule,
} from 'yargs';
import withErrorHandling from '../utils/with-error-handling';

export interface CommandArguments {
  endpoint: string;
  token: string;
}

export type CommandHandler<T extends CommandArguments> =
  (args: ArgumentsCamelCase<T>) => Promise<void>;

type Command<T extends CommandArguments> = {
  command: string;
  description: string;
  builder: CommandBuilder;
  handler?: CommandHandler<T>;
};

export function defineCommand<T extends CommandArguments>(cmd: Command<T>) {
  return {
    command: cmd.command,
    description: cmd.description,
    builder: cmd.builder,
    handler: withErrorHandling(cmd.handler),
  } as CommandModule;
}
