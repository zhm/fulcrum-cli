import http from 'http';
import axios from 'axios';
import path from 'path';
import fs from 'fs';
import queue from 'async/queue';
import Core from 'fulcrum-core';
import { mkdirp } from 'mkdirp';
import { fileFromPath } from 'formdata-node/file-from-path';
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
  console.log('fetching records', params);

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
  console.log('fetching records', params);

  const perPage = 20000;
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
  console.log('creating changeset', blue(form.id), green(comment));

  const json = await client.changesets.create(buildChangesetAttributes(form, comment));

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

  console.log(`${record.id ? 'updating' : 'creating'} record`, blue(record.id));

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

  await mkdirp('tmp');

  const downloadPath = path.join('tmp', object.access_key);

  console.log('downloading', type, blue(object.access_key), 'to', green(downloadPath));

  await download(object.original, downloadPath);

  const file = await fileFromPath(downloadPath);

  const newObject = await create(file, {});

  console.log('created', type, blue(newObject.access_key));

  return newObject;
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
