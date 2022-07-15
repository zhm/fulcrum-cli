#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const yargs_1 = __importDefault(require("yargs"));
const dotenv_defaults_1 = require("dotenv-defaults");
const loadDotEnvDefaultsMiddleware = () => {
    (0, dotenv_defaults_1.config)({
        path: path_1.default.join('.', '.env'),
        defaults: path_1.default.join('.', '.env.defaults'),
        encoding: 'utf8',
    });
};
// eslint-disable-next-line no-unused-expressions
yargs_1.default
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
//# sourceMappingURL=index.js.map