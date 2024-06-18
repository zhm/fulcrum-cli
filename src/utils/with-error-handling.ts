import path from 'path';
import { Argv } from 'yargs';
import { LogLevel, createLogger, log } from './logger';

type CommandFunction = (...args: any[]) => Promise<void>;

interface Args extends Argv {
  logDir: string;
}

export default function withErrorHandling(fn: CommandFunction): CommandFunction {
  return async (yargs: Args) => {
    try {
      createLogger(yargs.logDir, (process.env.LOG_LEVEL ?? 'log') as LogLevel);

      await fn(yargs);
    } catch (error) {
      log.debug('error', error);
    }
  };
}
