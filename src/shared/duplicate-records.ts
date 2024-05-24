import Core from 'fulcrum-core';
import {
  createRecords,
  fetchRecordsBySQL,
} from './api';
import Client from '../api/client';
import { blue } from './log';

export default async function duplicateRecords(
  client: Client,
  originID: string,
  destinationID: string,
  sql: string,
) {
  console.log('getting records from origin', blue(originID), 'with sql query of', blue(sql ?? `select * from "${originID}"`));

  const originForm = new Core.Form(await client.forms.find(originID));

  const records = await fetchRecordsBySQL(client, originForm, sql ?? `select * from "${originID}"`);
  const recordJSONs = records.map((record) => record.toJSON());

  console.log('fetching destination form', blue(destinationFormID));

  const destinationForm = new Core.Form(await client.forms.find(destinationFormID));

  console.log('creating', blue(recordJSONs.length), 'record(s)');

  await createRecords(client, recordJSONs, destinationForm);

  console.log('finished creating records');
}
