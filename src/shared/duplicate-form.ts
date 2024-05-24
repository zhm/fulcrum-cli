import {
  duplicateFormSchema,
  duplicateFormImage,
  duplicateRecordsWithMedia,
  duplicateReferenceFiles,
  duplicateWorkflows,
  fetchForm,
  fetchRecords,
} from './api';
import Client from '../api/client';

export default async function duplicateForm(
  client: Client,
  formID: string,
  duplicateRecords: boolean,
) {
  const existingForm = await fetchForm(client, formID);

  const form = await duplicateFormSchema(client, existingForm);

  await duplicateFormImage(client, existingForm, form.id);

  await duplicateReferenceFiles(client, existingForm.id, form.id);

  await duplicateWorkflows(client, existingForm.id, form.id);

  if (duplicateRecords) {
    const records = await fetchRecords(client, existingForm);

    await duplicateRecordsWithMedia(
      client,
      records,
      form,
      `Duplicating records from ${existingForm.name} (${existingForm.id})`,
    );
  }
}
