import Core from 'fulcrum-core';
import {
  duplicateRecordsWithMedia,
  fetchForm,
  fetchRecordsBySQL,
} from './api';
import Client from '../api/client';
import { blue } from './log';

export default async function duplicateRecords(
  client: Client,
  sourceFormID: string,
  destinationFormID: string,
  sql?: string,
  where?: string,
) {
  console.log('fetching records from source form', blue(sourceFormID));

  const form = await fetchForm(client, sourceFormID);

  const records = await fetchRecordsBySQL(client, form, sql, where);

  console.log('fetching destination form', blue(destinationFormID));

  const destinationForm = new Core.Form(await client.forms.find(destinationFormID));

  console.log('creating', blue(records.length), 'record(s)');

  await duplicateRecordsWithMedia(
    client,
    records,
    destinationForm,
    `Duplicating records from ${sourceFormID})`,
  );
}
