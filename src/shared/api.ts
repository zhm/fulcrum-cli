import http from 'http';
import axios from 'axios';
import queue from 'async/queue';
import Core from 'fulcrum-core';
import Client from '../api/client';
import { red, green, blue } from './log';

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

export type ChangesetOperationCallback = (changeset: Core.Changeset) => Promise<any>;

export async function batch(objects: any[], callback: BatchOperationCallback) {
  const q = queue(async (task) => {
    await callback(task);
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

  const perPage = 1;
  const records = [];

  let page = 1;
  let done = false;

  while (!done) {
    const result = await client.records.history({ ...params, page });

    records.push(...result.objects);

    page += 1;

    done = result.objects.length < perPage;
  }

  return records;
}

export async function fetchRecordsBySQL(client: Client, form: Core.Form, sql: string, where?: string) {
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

export async function executeRecordOperatons(
  client: Client,
  form: Core.Form,
  operations: RecordOperation[],
  comment?: string,
) {
  if (operations.length === 0) {
    return;
  }

  const update = (changeset) => batch(operations, (operation) => {
    if (operation.type === 'delete') {
      return deleteRecord(client, operation.id, changeset);
    }
    return saveRecord(client, operation.record, changeset);
  });

  await withChangeset(client, form, comment, update);
}
