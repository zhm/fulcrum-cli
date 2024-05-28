import Core from 'fulcrum-core';
import Client from '../api/client';
import { fetchForm } from './forms';
import { executeRecordOperations } from './records';
import { log } from '../utils/logger';

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
  log.info('fetching changeset', id);

  return new Core.Changeset(await client.changesets.find(id));
}

export async function createChangeset(client: Client, form: Core.Form, comment?: string) {
  const json = await client.changesets.create(buildChangesetAttributes(form, comment));

  log.info('created changeset', json.id, comment);

  return new Core.Changeset(json);
}

export async function closeChangeset(client: Client, changeset: Core.Changeset) {
  log.info('closing changeset', changeset.id);

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
  log.info('reverting changeset', changeset.id);

  const form = await fetchForm(client, changeset._formID);

  const history = await client.records.history({ changeset_id: changeset.id });

  log.info('found', history.objects.length, 'records');

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
