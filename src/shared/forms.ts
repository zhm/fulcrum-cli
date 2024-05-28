import Core from 'fulcrum-core';
import { fileFromPath } from 'formdata-node/file-from-path';
import Client from '../api/client';
import {
  duplicateRecordsWithMedia, executeRecordOperations, fetchHistoryRecords, fetchRecords,
} from './records';
import { duplicateReferenceFiles } from './attachments';
import { duplicateWorkflows } from './workflows';
import { log } from '../utils/logger';

export async function fetchForm(client: Client, id: string) {
  log.info('fetching form');

  return new Core.Form(await client.forms.find(id));
}

export async function deleteForm(client: Client, form: Core.Form) {
  log.info('deleting form', form.id);

  await client.forms.delete(form.id);
}

export async function fetchDeletedForm(client: Client, id: string) {
  log.info('fetching deleted form', id);

  const history = await client.forms.history({ id });

  const deleted = history.objects.find((o) => o.history_change_type === 'd');

  return deleted;
}

export async function duplicateFormImage(
  client: Client,
  sourceForm: Core.Form,
  destinationFormID: string,
) {
  if (sourceForm.image) {
    await client.withDownloadedFile({ url: sourceForm.image }, async (result) => {
      const file = await fileFromPath(result.outputFilePath);

      await client.forms.uploadImage(destinationFormID, file);
    });
  }
}

export async function duplicateFormSchema(
  client: Client,
  form: Core.Form,
) {
  const newForm = new Core.Form(await client.forms.create(form));

  log.info('created new form', newForm.name, newForm.id);

  return newForm;
}

export async function restoreForm(
  client: Client,
  deletedFormID: string,
  date: string,
) {
  const deletedForm = await fetchDeletedForm(client, deletedFormID);

  const form = new Core.Form(await client.forms.create(deletedForm));

  log.info('created new form', form.name, form.id);

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

  log.info('restoring', operations.length, 'record(s)');

  await executeRecordOperations({
    client, form, operations, comment: 'Restoring records',
  });
}

export default async function duplicateForm(
  client: Client,
  existingForm: Core.Form,
  duplicateRecords: boolean,
) {
  const newForm = await duplicateFormSchema(client, existingForm);

  await duplicateFormImage(client, existingForm, newForm.id);

  await duplicateReferenceFiles(client, existingForm.id, newForm.id);

  await duplicateWorkflows(client, existingForm.id, newForm.id);

  if (duplicateRecords) {
    const records = await fetchRecords(client, existingForm);

    await duplicateRecordsWithMedia(
      client,
      records,
      newForm,
      `Duplicating records from ${existingForm.name} (${existingForm.id})`,
    );
  }
}
