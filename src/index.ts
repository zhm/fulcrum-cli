#!/usr/bin/env node

import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { config } from 'dotenv-defaults';
import query from './commands/query';
import records from './commands/records';
import forms from './commands/forms';
import reports from './commands/reports';
import changesets from './commands/changesets';

const loadDotEnvDefaultsMiddleware = () => {
  config({
    path: path.join('.', '.env'),
    defaults: path.join('.', '.env.defaults'),
    encoding: 'utf8',
  });
};

// eslint-disable-next-line no-unused-expressions
yargs(hideBin(process.argv))
  .scriptName('fulcrum')
  .env('FULCRUM')
  .middleware([
    loadDotEnvDefaultsMiddleware,
  ])
  .option('endpoint', {
    default: 'https://api.fulcrumapp.com',
    describe: 'API endpoint',
  })
  .option('token', {
    required: true,
    describe: 'API token',
  })
  .option('logDir', {
    required: true,
    default: './logs',
    describe: 'Log directory',
  })
  .command(records)
  .command(forms)
  .command(query)
  .command(changesets)
  .command(reports)
  .help()
  .demandCommand()
  .strict().argv;
