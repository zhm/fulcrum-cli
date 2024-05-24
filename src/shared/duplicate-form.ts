import Core from 'fulcrum-core';
import {
  duplicateRecordsWithMedia,
  fetchForm,
  fetchRecords,
} from './api';
import Client from '../api/client';
import { blue } from './log';

export default async function duplicateForm(
  client: Client,
  formID: string,
) {
  const existingForm = await fetchForm(client, formID);

  const form = new Core.Form(await client.forms.create(existingForm));

  console.log('created new form', blue(form.name), blue(form.id));

  const records = await fetchRecords(client, { form_id: existingForm.id });

  await duplicateRecordsWithMedia(
    client,
    records,
    form,
    `Duplicating records from ${existingForm.name} (${existingForm.id})`,
  );
}
