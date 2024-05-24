#!/usr/bin/env node
// @ts-nocheck
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { config } from 'dotenv-defaults';
import deleteRecords from './commands/delete-records';
import query from './commands/query';
import revertChangeset from './commands/revert-changeset';
import updateCalculations from './commands/update-calculations';
import updateRecords from './commands/update-records';
import restoreForm from './commands/restore-form';
import duplicateForm from './commands/duplicate-form';
import duplicateRecords from './commands/duplicate-records';
import uploadReferenceFile from './commands/upload-reference-file';

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
  .command(deleteRecords)
  .command(query)
  .command(revertChangeset)
  .command(updateCalculations)
  .command(updateRecords)
  .command(restoreForm)
  .command(duplicateForm)
  .command(duplicateRecords)
  .command(uploadReferenceFile)
  .demandCommand()
  .strict().argv;
