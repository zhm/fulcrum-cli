import Core from 'fulcrum-core';
import {
  batch,
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

export default async function restoreForm(
  client: Client,
  formID: string,
) {
  const existingForm = await fetchForm(client, formID);

  const form = new Core.Form(await client.forms.create(existingForm));
  // const form = existingForm;

  console.log('created new form', blue(form.name), blue(form.id));

  const records = await fetchRecords(client, { form_id: existingForm.id });

  const operations = [];

  for (const attrs of records) {
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

  console.log('duplicating', blue(operations.length), 'record(s)');

  const copyMedia = async (record: Core.Record) => {
    await batch(record.formValues.mediaValues, async (item) => {
      if (item.mediaKey === 'photo_id') {
        const object = await duplicatePhoto(client, item.mediaID);

        item.mediaID = object.access_key;
      } else if (item.mediaKey === 'audio_id') {
        const object = await duplicateAudio(client, item.mediaID);

        item.mediaID = object.access_key;
      } else if (item.mediaKey === 'video_id') {
        const object = await duplicateVideo(client, item.mediaID);

        item.mediaID = object.access_key;
      } else if (item instanceof Core.SignatureValue) {
        const object = await duplicateSignature(client, item.id);

        item.id = object.access_key;
      }
    });
  };

  await executeRecordOperations({
    client, form, operations, comment: 'Duplicating form and records', beforeUpdate: copyMedia,
  });
}
