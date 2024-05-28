import Core from 'fulcrum-core';
import fs from 'fs';
import { mkdirp } from 'mkdirp';
import path from 'path';
import Client, { FileDownloadResult } from '../api/client';
import { blue } from './log';
import { batch } from './api';
import FileNamer from './file-namer';

export async function runReport(
  client: Client,
  record: Core.Record,
  reportID: string,
  directory: string,
) {
  mkdirp.sync(directory);

  const namer = new FileNamer({ directory });

  const onDownloadFile = async (result: FileDownloadResult) => {
    const name = await namer.getName(result.responseFileName);

    const outputPath = path.join(directory, name);

    console.log('saving report to', blue(outputPath));

    return fs.promises.rename(result.outputFilePath, outputPath);
  };

  console.log('running report for record', blue(record.id));

  await client.reports.generate(record.id, reportID, onDownloadFile);
}

export async function runReports(
  client: Client,
  records: Core.Record[],
  reportID: string,
  directory: string,
) {
  return batch(records, async (record) => runReport(
    client,
    record,
    reportID,
    directory,
  ));
}
