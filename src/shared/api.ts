import axios from 'axios';
import { chunk } from 'lodash';
import {
  Form, Record, User, Role, Changeset,
} from 'fulcrum-core';
import Client from '../api/client';
import { red, green, blue } from './log';

export interface Organization {
  id: string;
  name: string;
}

export interface Context {
  user: User;
  role: Role;
  organization: Organization;
}

export function createClient(endpoint: string, token: string) {
  return new Client({
    base: `${endpoint}/api/v2`,
    config: {
      query_url: endpoint,
    },
    token,
    request: axios,
    userAgent: 'Fulcrum CLI',
  });
}

export async function fetchContext(client: Client): Promise<Context> {
  console.log('fetching context');

  const json = await client.user.find();

  const user = new User(json);

  const context = json.contexts.find((o) => o.id === json.current_organization.id);

  const role = new Role(context.role);

  const organization = {
    id: context.id,
    name: context.name,
  };

  return { user, role, organization };
}

export async function fetchForm(client: Client, id: string) {
  console.log('fetching form', id);

  return new Form(await client.forms.find(id));
}

export async function fetchRecordsBySQL(client: Client, form: Form, sql: string, where?: string) {
  console.log('fetching records by sql', sql, where);

  const query = where ? `${sql} WHERE ${where}` : sql;

  const result = await client.query.run({ q: query });

  const ids = result.objects.map((o) => o._record_id ?? o.record_id ?? o.id);

  const records = [];

  for (const id of ids) {
    const record = new Record(await client.records.find(id), form);

    if (record.projectID) {
      console.log('fetching project', record.projectID);

      const project = await client.projects.find(record.projectID);

      record.project = project;
    }

    records.push(record);
  }

  return records;
}

function buildChangesetAttributes(form: Form, comment?: string) {
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

  return new Changeset(await client.changesets.find(id));
}

export async function createChangeset(client: Client, form: Form, comment?: string) {
  console.log('creating changeset', blue(form.id), green(comment));

  const json = await client.changesets.create(buildChangesetAttributes(form, comment));

  return new Changeset(json);
}

export async function closeChangeset(client: Client, changeset: Changeset) {
  console.log('closing changeset', blue(changeset.id));
  return client.changesets.close(changeset.id);
}

export async function deleteRecord(client: Client, id: string, changeset?: Changeset) {
  console.log('deleting record', blue(id));

  return client.records.delete(id, changeset.id);
}

export async function saveRecord(client: Client, record: Record, changeset?: Changeset) {
  record.changeset = changeset;

  console.log(`${record.id ? 'updating' : 'creating'} record`, blue(record.id));

  const json = await client.records.create(record.toJSON());

  record.updateFromAPIAttributes(json);

  return record;
}

export async function saveRecords(
  client: Client,
  form: Form,
  records: Record[],
  comment?: string,
) {
  if (records.length === 0) {
    return;
  }

  const changeset = await createChangeset(client, form, comment);

  for (const batch of chunk(records, 5)) {
    console.log('syncing batch');

    await Promise.all(batch.map((record) => saveRecord(client, record, changeset)));
  }

  await closeChangeset(client, changeset);
}

export async function deleteRecords(
  client: Client,
  form: Form,
  records: Record[],
  comment?: string,
) {
  if (records.length === 0) {
    return;
  }

  const changeset = await createChangeset(client, form, comment);

  for (const batch of chunk(records, 5)) {
    console.log('deleting batch');

    await Promise.all(batch.map((record) => deleteRecord(client, record.id, changeset)));
  }

  await closeChangeset(client, changeset);
}

export interface RecordOperation {
  type: 'create' | 'update' | 'delete';
  id?: string;
  record?: Record;
}

export async function executeRecordOperatons(
  client: Client,
  form: Form,
  operations: RecordOperation[],
  comment?: string,
) {
  if (operations.length === 0) {
    return;
  }

  const newChangeset = await createChangeset(client, form, comment);

  for (const operation of operations) {
    if (operation.type === 'delete') {
      await deleteRecord(client, operation.id, newChangeset);
    } else {
      await saveRecord(client, operation.record, newChangeset);
    }
  }

  await closeChangeset(client, newChangeset);
}
