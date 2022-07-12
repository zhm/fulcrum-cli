#!/usr/bin/env node

import path from 'path';
import yargs from 'yargs';
import { config } from 'dotenv-defaults';

const loadDotEnvDefaultsMiddleware = () => {
  config({
    path: path.join('.', '.env'),
    defaults: path.join('.', '.env.defaults'),
    encoding: 'utf8',
  });
};

// eslint-disable-next-line no-unused-expressions
yargs
  .scriptName('fulcrum')
  .middleware([
    loadDotEnvDefaultsMiddleware,
  ])
  .option('endpoint', {
    default: 'https://api.fulcrumapp.com',
    describe: 'API endpoint',
  })
  .option('token', {
    describe: 'API token',
  })
  .commandDir('./commands', { extensions: ['js', 'ts'] })
  .demandCommand()
  .strict().argv;
