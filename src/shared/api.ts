import http from 'http';
import axios from 'axios';
import path from 'path';
import fs from 'fs';
import queue from 'async/queue';
import Core, { Form, Record } from 'fulcrum-core';
import { mkdirp } from 'mkdirp';
import { fileFromPath } from 'formdata-node/file-from-path';
import { randomUUID } from 'crypto';
import { filesize } from 'filesize';
import Client from '../api/client';
import { green, blue, red } from './log';

export interface Organization {
  id: string;
  name: string;
}

export interface Context {
  user: Core.User;
  role: Core.Role;
  organization: Organization;
}

export type BatchOperationCallback = (object: any) => Promise<any>;

export type RecordProcessor = (record: Core.Record) => Promise<any>;

export type ChangesetOperationCallback = (changeset: Core.Changeset) => Promise<any>;

export async function batch(objects: any[], callback: BatchOperationCallback) {
  const q = queue(async (task) => {
    try {
      await callback(task);
    } catch (ex) {
      console.error(red('error'), ex.message);
    }
  }, process.env.FULCRUM_BATCH_SIZE ?? 15);

  q.push(objects);

  await q.drain();
}

export function createClient(endpoint: string, token: string) {
  const request = axios.create({
    httpAgent: new http.Agent({ keepAlive: true }),
  });

  return new Client({
    base: `${endpoint}/api/v2`,
    config: {
      query_url: endpoint,
    },
    token,
    request,
    userAgent: 'Fulcrum CLI',
  });
}

export async function fetchContext(client: Client): Promise<Context> {
  console.log('fetching context');

  const json = await client.user.find();

  const user = new Core.User(json);

  const context = json.contexts.find((o) => o.id === json.current_organization.id);

  const role = new Core.Role(context.role);

  const organization = {
    id: context.id,
    name: context.name,
  };

  return { user, role, organization };
}

export async function fetchForm(client: Client, id: string) {
  console.log('fetching form', id);

  return new Core.Form(await client.forms.find(id));
}

export async function fetchDeletedForm(client: Client, id: string) {
  console.log('fetching deleted form', id);

  const history = await client.forms.history({ id });

  const deleted = history.objects.find((o) => o.history_change_type === 'd');

  return deleted;
}

export async function fetchRecord(client: Client, id: string, form: Core.Form) {
  console.log('fetching record', id);

  return new Core.Record(await client.records.find(id), form);
}

export async function fetchHistoryRecords(client: Client, params: any) {
  const perPage = 20000;
  const records = [];

  let page = 1;
  let done = false;

  while (!done) {
    console.log('fetching records page', blue(page));

    const result = await client.records.history({ ...params, page });

    records.push(...result.objects);

    page += 1;

    done = result.objects.length < perPage;
  }

  console.log('fetched', blue(records.length), 'history record(s)');

  return records;
}

export async function fetchRecords(client: Client, params: any) {
  const perPage = 5000;
  const records = [];

  let page = 1;
  let done = false;

  while (!done) {
    console.log('fetching records page', blue(page));

    const result = await client.records.all({ ...params, page });

    records.push(...result.objects);

    page += 1;

    done = result.objects.length < perPage;
  }

  console.log('fetched', blue(records.length), 'record(s)');

  return records;
}

export async function fetchRecordsBySQL(
  client: Client,
  form: Core.Form,
  sql: string,
  where?: string,
) {
  console.log('fetching records by sql', sql, where);

  const query = where ? `${sql} WHERE ${where}` : sql;

  const result = await client.query.run({ q: query });

  const ids = result.objects.map((o) => o._record_id ?? o.record_id ?? o.id);

  const records = [];

  await batch(ids, async (id) => {
    const record = await fetchRecord(client, id, form);

    if (record.projectID) {
      console.log('fetching project', record.projectID);

      const project = await client.projects.find(record.projectID);

      record.project = project;
    }

    records.push(record);
  });

  return records;
}

function buildChangesetAttributes(form: Core.Form, comment?: string) {
  return {
    form_id: form.id,
    metadata: {
      comment,
      application: 'Fulcrum CLI',
      platform: 'cli',
      platform_version: '1.0.0',
    },
  };
}

export async function fetchChangeset(client: Client, id: string) {
  console.log('fetching changeset', id);

  return new Core.Changeset(await client.changesets.find(id));
}

export async function createChangeset(client: Client, form: Core.Form, comment?: string) {
  const json = await client.changesets.create(buildChangesetAttributes(form, comment));

  console.log('created changeset', blue(json.id), green(comment));

  return new Core.Changeset(json);
}

export async function closeChangeset(client: Client, changeset: Core.Changeset) {
  console.log('closing changeset', blue(changeset.id));
  return client.changesets.close(changeset.id);
}

export async function deleteRecord(client: Client, id: string, changeset?: Core.Changeset) {
  console.log('deleting record', blue(id));

  return client.records.delete(id, changeset.id);
}

export async function saveRecord(client: Client, record: Core.Record, changeset?: Core.Changeset) {
  record.changeset = changeset;

  console.log(`${record.version ? 'updating' : 'creating'} record`, blue(record.id));

  const json = await client.records.create(record.toJSON());

  record.updateFromAPIAttributes(json);

  return record;
}

export async function withChangeset(
  client: Client,
  form: Core.Form,
  comment: string,
  callback: ChangesetOperationCallback,
) {
  const changeset = await createChangeset(client, form, comment);

  await callback(changeset);

  await closeChangeset(client, changeset);
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

export async function duplicateMedia(
  type: string,
  mediaID: string,
  find: (id: string) => Promise<any>,
  create: (file: any, attributes: any) => Promise<any>,
) {
  const object = await find(mediaID);

  return withDownloadedFile(object.original, async (filePath) => {
    const file = await fileFromPath(filePath);

    const newObject = await create(file, {});

    console.log('created', type, blue(newObject.access_key));

    return newObject;
  });
}

export async function duplicatePhoto(client: Client, mediaID: string) {
  return duplicateMedia(
    'photo',
    mediaID,
    (id) => client.photos.find(id),
    (file, attributes) => client.photos.create(file, attributes),
  );
}

export async function duplicateAudio(client: Client, mediaID: string) {
  return duplicateMedia(
    'audio',
    mediaID,
    (id) => client.audio.find(id),
    (file, attributes) => client.audio.create(file, attributes),
  );
}

export async function duplicateVideo(client: Client, mediaID: string) {
  return duplicateMedia(
    'video',
    mediaID,
    (id) => client.videos.find(id),
    (file, attributes) => client.videos.create(file, attributes),
  );
}

export async function duplicateSignature(client: Client, mediaID: string) {
  return duplicateMedia(
    'signature',
    mediaID,
    (id) => client.signatures.find(id),
    (file, attributes) => client.signatures.create(file, attributes),
  );
}

export async function download(url, outputFileName) {
  return new Promise(async (resolve, reject) => {
    const destStream = fs.createWriteStream(outputFileName);

    try {
      const config = {
        method: 'GET',
        url,
        responseType: 'stream',
        headers: {},
      };

      await axios(config)
        .then((res) => new Promise((resolve, reject) => {
          res.data.pipe(destStream);
          destStream
            .on('error', (err) => {
              reject({ response: { statusText: err.message } }); // Use same shape as axios error
            })
            .on('close', () => {
              resolve();
            });
        }));

      resolve();
    } catch (err) {
      destStream.close();
      reject(err);
    }
  });
}

export async function duplicateRecordsWithMedia(
  client: Client,
  records: Record[],
  form: Form,
  comment: string,
) {
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
    client, form, operations, comment, beforeUpdate: copyMedia,
  });
}

export async function deleteAttachmentsByName(
  client: Client,
  formID: string,
  name: string,
) {
  const attachments = await client.attachments.all({ owner_type: 'form', form_id: formID });

  const existing = attachments.objects.filter((attachment) => attachment.name === name);

  await batch(existing, async (attachment) => {
    console.log('deleting attachment', blue(name), green(attachment.id));

    return client.attachments.delete(attachment.id);
  });
}

export async function createAttachment(
  client: Client,
  formID: string,
  filePath: string,
  name: string,
) {
  const attachment = {
    name,
    owners: [{ type: 'form', id: formID }],
    file_size: (await fs.promises.stat(filePath)).size,
    metadata: {
      filename: name,
    },
  };

  console.log('creating attachment', blue(name), red(filesize(attachment.file_size)));

  return client.attachments.create(attachment, filePath);
}

export async function withDownloadedFile(
  url: string,
  process: (filePath: string) => Promise<any>,
): Promise<any> {
  let filePath = null;

  try {
    filePath = await downloadFile(url);

    const result = await process(filePath);

    return result;
  } finally {
    if (filePath) {
      await fs.promises.unlink(filePath);
    }
  }
}

export async function downloadFile(
  url: string,
) {
  await mkdirp('tmp');

  const downloadPath = path.join('tmp', randomUUID());

  // console.log('downloading file', blue(url), 'to', green(downloadPath));

  await download(url, downloadPath);

  return downloadPath;
}

export async function duplicateReferenceFiles(
  client: Client,
  sourceFormID: string,
  destinationFormID: string,
) {
  const attachments = await client.attachments.all({ owner_type: 'form', form_id: sourceFormID });

  await batch(attachments.objects, async (attachment) => {
    await withDownloadedFile(attachment.url, async (filePath) => {
      await createAttachment(client, destinationFormID, filePath, attachment.name);
    });
  });
}

export async function duplicateFormImage(
  client: Client,
  sourceForm: Core.Form,
  destinationFormID: string,
) {
  if (sourceForm.image) {
    await withDownloadedFile(sourceForm.image, async (filePath) => {
      const file = await fileFromPath(filePath);

      await client.forms.uploadImage(destinationFormID, file);
    });
  }
}

export async function duplicateWorkflows(
  client: Client,
  sourceFormID: string,
  destinationFormID: string,
) {
  const workflows = await client.workflows.all({ form_id: sourceFormID });

  const filtered = workflows.objects.filter((w) => w.object_resource_id === sourceFormID);

  for (const workflow of filtered) {
    const idMap = {};

    for (const step of workflow.steps) {
      idMap[step.id] = randomUUID();
    }

    for (const step of workflow.steps) {
      step.id = idMap[step.id];
      step.next_steps = step.next_steps.map((nextStepId) => idMap[nextStepId]);
    }

    const newWorkflow = {
      ...workflow,
      id: null,
      object_resource_id: destinationFormID,
      active: false,
    };

    console.log('creating workflow', blue(newWorkflow.name));

    await client.workflows.create(newWorkflow);
  }
}

export async function duplicateFormSchema(
  client: Client,
  form: Core.Form,
) {
  const newForm = new Core.Form(await client.forms.create(form));

  console.log('created new form', blue(newForm.name), blue(newForm.id));

  return newForm;
}
