import Core from 'fulcrum-core';
import Client from '../api/client';
import { Context, batch } from './api';
import { withChangeset } from './changesets';
import {
  duplicateAudio,
  duplicatePhoto,
  duplicateSignature,
  duplicateVideo,
} from './attachments';
import { shutdownSandbox, updateCalculations } from './calculations';
import { fetchForm } from './forms';
import { log } from '../utils/logger';

export type RecordProcessor = (record: Core.Record) => Promise<any>;

export type RecordOperationCallback = (record: Core.Record) => Promise<RecordOperation | null>;

export async function fetchRecord(client: Client, id: string, form?: Core.Form) {
  log.info('fetching record', id);

  const json = await client.records.find(id);

  return new Core.Record(
    json,
    form ?? await fetchForm(client, json.form_id),
  );
}

export async function fetchHistoryRecords(client: Client, params: any) {
  const perPage = 20000;
  const records = [];

  let page = 1;
  let done = false;

  while (!done) {
    log.info('fetching records page', page);

    const result = await client.records.history({ ...params, page });

    records.push(...result.objects);

    page += 1;

    done = result.objects.length < perPage;
  }

  log.info('fetched', records.length, 'history record(s)');

  return records;
}

export async function fetchRecords(
  client: Client,
  form: Core.Form,
  params?: any,
) {
  const perPage = 5000;
  const records = [];

  let page = 1;
  let done = false;

  while (!done) {
    log.info('fetching records page', page);

    const result = await client.records.all({ ...{ form_id: form.id, ...params }, page });

    records.push(...result.objects.map((attrs) => new Core.Record(attrs, form)));

    page += 1;

    done = result.objects.length < perPage;
  }

  log.info('fetched', records.length, 'record(s)');

  return records;
}

export async function fetchRecordsBySQL(
  client: Client,
  form: Core.Form,
  sql?: string,
  where?: string,
) {
  const select = sql ?? `SELECT * FROM "${form.id}"`;

  const query = where ? `${select} WHERE ${where}` : select;

  log.info('fetching records by sql', query);

  const result = await client.query.run({ q: query });

  const ids = result.objects.map((o) => o._record_id ?? o.record_id ?? o.id);

  const records = [];

  await batch(ids, async (id) => {
    const record = await fetchRecord(client, id, form);

    if (record.projectID) {
      log.info('fetching project', record.projectID);

      const project = await client.projects.find(record.projectID);

      record.project = project;
    }

    records.push(record);
  });

  return records;
}

export async function saveRecord(client: Client, record: Core.Record, changeset?: Core.Changeset) {
  record.changeset = changeset;

  log.info(`${record.version ? 'updating' : 'creating'} record`, record.id);

  const json = await client.records.create(record.toJSON());

  record.updateFromAPIAttributes(json);

  return record;
}

export async function saveRecords(
  client: Client,
  form: Core.Form,
  records: Core.Record[],
  comment?: string,
) {
  if (records.length === 0) {
    return;
  }

  await withChangeset(client, form, comment, async (changeset) => {
    await batch(records, (record) => saveRecord(client, record, changeset));
  });
}

export async function deleteRecord(client: Client, id: string, changeset?: Core.Changeset) {
  log.info('deleting record', id);

  return client.records.delete(id, changeset.id);
}

export async function deleteRecords(
  client: Client,
  form: Core.Form,
  records: Core.Record[],
  comment?: string,
) {
  if (records.length === 0) {
    return;
  }
  await withChangeset(client, form, comment, async (changeset) => {
    await batch(records, (record) => deleteRecord(client, record.id, changeset));
  });
}

export interface RecordOperation {
  type: 'create' | 'update' | 'delete';
  id?: string;
  record?: Core.Record;
}

export async function restoreRecords(
  client: Client,
  form: Core.Form,
  deletedRecordIDs: string[],
) {
  const deletedRecords = [];

  await batch(deletedRecordIDs, async (id) => {
    const history = await fetchHistoryRecords(client, { form_id: form.id, record_id: id });

    const deleted = history.find((r) => r.history_change_type === 'd');

    if (deleted) {
      deletedRecords.push(deleted);
    } else {
      log.error('cannot restore record', id, 'record not deleted');
    }
  });

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

export async function executeRecordOperations({
  client,
  form,
  operations,
  comment,
  beforeUpdate,
  afterUpdate,
}: {
  client: Client,
  form: Core.Form,
  operations: RecordOperation[],
  comment?: string,
  beforeUpdate?: RecordProcessor,
  afterUpdate?: RecordProcessor,
}) {
  if (operations.length === 0) {
    return;
  }

  const update = (changeset) => batch(operations, async (operation) => {
    if (beforeUpdate) {
      await beforeUpdate(operation.record);
    }

    let result = null;

    if (operation.type === 'delete') {
      result = deleteRecord(client, operation.id, changeset);
    } else {
      result = saveRecord(client, operation.record, changeset);
    }

    if (afterUpdate) {
      await afterUpdate(operation.record);
    }

    return result;
  });

  await withChangeset(client, form, comment, update);
}

export default async function duplicateRecords(
  client: Client,
  sourceForm: Core.Form,
  destinationForm: Core.Form,
  sql?: string,
  where?: string,
) {
  log.info('fetching records from source form', sourceForm.id);

  const records = await fetchRecordsBySQL(client, sourceForm, sql, where);

  log.info('creating', records.length, 'record(s)');

  await duplicateRecordsWithMedia(
    client,
    records,
    destinationForm,
    `Duplicating records from ${sourceForm.id})`,
  );
}

export async function duplicateRecordsWithMedia(
  client: Client,
  records: Core.Record[],
  form: Core.Form,
  comment: string,
) {
  const operations = [];

  for (const record of records) {
    const newRecord = {
      ...record.toJSON(),
      id: null,
      version: null,
      form_id: form.id,
    };

    operations.push({
      action: 'create',
      record: new Core.Record(newRecord, form),
    });
  }

  log.info('duplicating', operations.length, 'record(s)');

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
    client, form, operations, comment, beforeUpdate: copyMedia,
  });
}

export async function updateRecords(
  client: Client,
  form: Core.Form,
  records: Core.Record[],
  context: Context,
  comment?: string,
  callback?: RecordOperationCallback,
) {
  const operations = [];

  for (const record of records) {
    const operation = await callback(record);

    if (operation) {
      if (operation.record) {
        await updateCalculations(record, context);
      }

      operations.push(operation);
    }
  }

  await executeRecordOperations({
    client, form, operations, comment,
  });

  await shutdownSandbox();
}

export async function updateRecordFields(
  client: Client,
  form: Core.Form,
  records: Core.Record[],
  context: Context,
  fields: string[],
  values: string[],
  comment?: string,
) {
  const updateElement = (record: Core.Record, dataName: string, dataValue?: string) => {
    const element = record.form.find(dataName);

    let newValue = null;

    if (dataValue != null) {
      newValue = record.formValues.createValueFromString(element, dataValue);
    }

    record.formValues.set(element.key, newValue);
  };

  const updateStatus = (record: Core.Record, dataName: string, dataValue?: string) => {
    record.status = dataValue ?? null;
  };

  const updateProject = (record: Core.Record, dataName: string, dataValue?: string) => {
    record.projectID = dataValue ?? null;
  };

  const updateAssignment = (record: Core.Record, dataName: string, dataValue?: string) => {
    record.assignedToID = dataValue ?? null;
  };

  const UPDATERS = {
    '@status': updateStatus,
    '@project': updateProject,
    '@assigned_to': updateAssignment,
  };

  const callback = async (record: Core.Record) => {
    for (let index = 0; index < fields.length; ++index) {
      const dataName = fields[index];
      const dataValue = values[index] !== '' ? values[index] : null;

      const updater = UPDATERS[dataName] ?? updateElement;

      updater(record, dataName, dataValue);
    }

    return { type: 'update', record } as RecordOperation;
  };

  await updateRecords(
    client,
    form,
    records,
    context,
    comment ?? 'Updating records',
    callback,
  );
}
