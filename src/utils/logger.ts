import { format } from 'util';
import fs from 'fs';
import path from 'path';
import { mkdirp } from 'mkdirp';

const DEBUG = 'debug';
const LOG = 'log';
const WARN = 'warn';
const ERROR = 'error';
const INFO = 'info';

type LogLevel = 'debug' | 'log' | 'warn' | 'error' | 'info';

const LEVELS = [
  DEBUG,
  LOG,
  WARN,
  ERROR,
  INFO,
];

export class Logger {
  private path: string;

  private level: LogLevel;

  constructor(logPath, level: LogLevel = LOG) {
    this.path = logPath;
    this.level = level;

    mkdirp.sync(this.path);
  }

  write(content) {
    if (content != null) {
      fs.appendFileSync(this.logFilePath, `${content.toString()}\n`);
    }
  }

  get logFilePath() {
    return path.join(this.path, `fulcrum-${new Date().toISOString().substring(0, 10)}.log`);
  }

  withContext = (context) => ({
    debug: (...args) => this.outputWithContext(DEBUG, context, ...args),
    log: (...args) => this.outputWithContext(LOG, context, ...args),
    warn: (...args) => this.outputWithContext(WARN, context, ...args),
    error: (...args) => this.outputWithContext(ERROR, context, ...args),
    info: (...args) => this.outputWithContext(INFO, context, ...args),
  });

  shouldLog(level) {
    return LEVELS.indexOf(level) >= LEVELS.indexOf(this.level);
  }

  outputWithContext = (level, context, ...args) => {
    const message = `${this.prefix(level ?? LOG, context)} ${format(...args)}`;

    this.write(message);

    if (this.shouldLog(level)) {
      console[level](...args);
    }
  };

  output = (level: LogLevel, ...args) => {
    if (args.length > 0 && args[0].context) {
      this.outputWithContext(level, args[0].context, ...args.slice(1));
    } else {
      this.outputWithContext(level, null, ...args);
    }
  };

  debug = (...args) => {
    this.output(DEBUG, ...args);
  };

  log = (...args) => {
    this.output(LOG, ...args);
  };

  warn = (...args) => {
    this.output(WARN, ...args);
  };

  error = (...args) => {
    this.output(ERROR, ...args);
  };

  info = (...args) => {
    this.output(INFO, ...args);
  };

  prefix(level, context) {
    return `[${new Date().toISOString()}] [${level}]${context ? ` [${context}]` : ''}`;
  }
}

let logger: Logger = null;

export const createLogger = (logPath, level) => {
  logger = new Logger(logPath, level);
};

export const log = {
  debug: (...args) => logger.debug(...args),
  log: (...args) => logger.log(...args),
  warn: (...args) => logger.warn(...args),
  error: (...args) => logger.error(...args),
  info: (...args) => logger.info(...args),
};
