import {
  Record, Form,
} from 'fulcrum-core';
import { executeRecordOperatons, RecordOperation, Context } from './api';
import { updateCalculations, shutdownSandbox } from './update-calculations';
import Client from '../api/client';

export type RecordOperationCallback = (record: Record) => Promise<RecordOperation | null>;

export async function updateRecords(
  client: Client,
  form: Form,
  records: Record[],
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

  await executeRecordOperatons(client, form, operations, comment);

  await shutdownSandbox();
}

export async function updateRecordFields(
  client: Client,
  form: Form,
  records: Record[],
  context: Context,
  fields: string[],
  values: string[],
  comment?: string,
) {
  const updateElement = (record: Record, dataName: string, dataValue?: string) => {
    const element = record.form.find(dataName);

    let newValue = null;

    if (dataValue != null) {
      newValue = record.formValues.createValueFromString(element, dataValue);
    }

    record.formValues.set(element.key, newValue);
  };

  const updateStatus = (record: Record, dataName: string, dataValue?: string) => {
    record.status = dataValue ?? null;
  };

  const updateProject = (record: Record, dataName: string, dataValue?: string) => {
    record.projectID = dataValue ?? null;
  };

  const updateAssignment = (record: Record, dataName: string, dataValue?: string) => {
    record.assignedToID = dataValue ?? null;
  };

  const UPDATERS = {
    '@status': updateStatus,
    '@project': updateProject,
    '@assigned_to': updateAssignment,
  };

  const callback = async (record: Record) => {
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
