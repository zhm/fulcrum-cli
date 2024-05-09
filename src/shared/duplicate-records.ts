import Core from 'fulcrum-core';
import {
  batch,
  createRecords,
  duplicateAudio,
  duplicatePhoto,
  duplicateSignature,
  duplicateVideo,
  executeRecordOperations,
  fetchForm,
  fetchRecords,
} from './api';
import Client from '../api/client';
import { blue } from './log';

export default async function duplicateRecords(
  client: Client,
  originID: string,
  destinationID: string,
) {
  console.log('getting records from origin', blue(originID));

  const records = await fetchRecords(client, { form_id: originID });

  console.log('getting destination form', blue(destinationID));

  const destinationForm = new Core.Form(await client.forms.find(destinationID));

  console.log('creating', blue(records.length), 'record(s)');

  await createRecords(client, records, destinationForm);

  console.log('COMPLETE!');
}
