import path from 'path';
import { Argv } from 'yargs';
import { createLogger, log } from './logger';

type CommandFunction = (...args: any[]) => Promise<void>;

interface Args extends Argv {
  logDir: string;
}

export default function withErrorHandling(fn: CommandFunction): CommandFunction {
  return async (yargs: Args) => {
    try {
      createLogger(yargs.logDir, 'debug');

      await fn(yargs);
    } catch (error) {
      log.info('error', error);
    }
  };
}
