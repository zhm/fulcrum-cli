import Core from 'fulcrum-core';
import {
  executeRecordOperations,
  fetchDeletedForm,
  fetchHistoryRecords,
} from './api';
import Client from '../api/client';
import { blue } from './log';

export default async function restoreForm(
  client: Client,
  formID: string,
  date: string,
) {
  const deletedForm = await fetchDeletedForm(client, formID);

  const form = new Core.Form(await client.forms.create(deletedForm));

  console.log('created new form', blue(form.name), blue(form.id));

  const params = {
    deleted_form_id: deletedForm.id,
    updated_since: date ?? deletedForm.history_created_at,
  };

  const historyRecords = await fetchHistoryRecords(client, params);

  const deletedRecords = historyRecords.filter((record) => record.history_change_type === 'd');

  const operations = [];

  for (const attrs of deletedRecords) {
    const newRecord = {
      ...attrs,
      id: null,
      version: null,
      form_id: form.id,
    };

    operations.push({
      action: 'create',
      record: new Core.Record(newRecord, form),
    });
  }

  console.log('restoring', blue(operations.length), 'record(s)');

  await executeRecordOperations(client, form, operations, 'Restoring records');
}
