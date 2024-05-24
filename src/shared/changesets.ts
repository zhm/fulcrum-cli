import Core from 'fulcrum-core';
import Client from '../api/client';
import { green, blue } from './log';
import { fetchForm } from './forms';
import { deleteRecord, executeRecordOperations, saveRecord } from './records';

export type ChangesetOperationCallback = (changeset: Core.Changeset) => Promise<any>;

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

export async function revertChangeset(
  client: Client,
  changeset: Core.Changeset,
) {
  console.log('reverting changeset', changeset.id);

  const form = await fetchForm(client, changeset._formID);

  const history = await client.records.history({ changeset_id: changeset.id });

  console.log('found', history.objects.length, 'records');

  const operations = [];

  for (const historyRecord of history.objects) {
    switch (historyRecord.history_change_type) {
      case 'u': {
        const { objects: allVersions } = await client.records.history({
          record_id: historyRecord.id,
        });

        const currentVersion = allVersions.slice(-1);

        const previousVersion = allVersions.find((o) => o.version === historyRecord.version - 1);

        operations.push({
          type: 'update',
          record: new Core.Record({
            ...previousVersion, version: currentVersion.version,
          }, form),
        });

        break;
      }
      case 'c': {
        operations.push({
          type: 'delete',
          id: historyRecord.id,
        });

        break;
      }
      case 'd': {
        operations.push({
          type: 'create',
          record: new Core.Record({
            ...historyRecord,
            id: null,
          }, form),
        });

        break;
      }
      default: throw new Error(`invalid history change type: ${history.history_change_type}`);
    }
  }

  await executeRecordOperations({
    client,
    form,
    operations,
    comment: `Reverting changeset ${changeset.id}`,
  });
}
