import { last } from 'lodash';
import Core from 'fulcrum-core';
import Client from '../api/client';
import {
  fetchChangeset,
  fetchForm,
  createChangeset,
  closeChangeset,
  saveRecord,
  deleteRecord,
} from './api';

export default async function revertChangeset(client: Client, changesetID: string) {
  console.log('reverting changeset', changesetID);

  const changeset = await fetchChangeset(client, changesetID);

  const form = await fetchForm(client, changeset._formID);

  const history = await client.records.history({ changeset_id: changesetID });

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

  const newChangeset = await createChangeset(client, form, `Reverting changeset ${changesetID}`);

  for (const operation of operations) {
    if (operation.type === 'delete') {
      await deleteRecord(client, operation.id, newChangeset);
    } else {
      await saveRecord(client, operation.record, newChangeset);
    }
  }

  await closeChangeset(client, newChangeset);
}
