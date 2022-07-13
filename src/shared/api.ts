import axios from 'axios';
import {
  Form, Record, RepeatableItemValue, RepeatableValue, Feature,
} from 'fulcrum-core';
import ContainerElement from 'fulcrum-core/src/elements/container-element';
import fs from 'fs';
import path from 'path';
import Sandbox from 'v8-sandbox';
import Client from '../api/client';

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

export async function fetchForm(client: Client, id: string) {
  return new Form(await client.forms.find(id));
}

export async function fetchRecordsBySQL(client: Client, form: Form, sql: string) {
  const result = await client.query.run({ q: sql });

  const ids = result.objects.map((o) => o._record_id ?? o.record_id ?? o.id);

  const records = [];

  for (const id of ids) {
    // eslint-disable-next-line no-await-in-loop
    records.push(new Record(await client.records.find(id), form));
  }

  return records;
}

const EXPRESSIONS = fs.readFileSync(path.join(__dirname, '..', '..', 'resources', 'expressions.js')).toString();

const SCRIPT = `
  Object.assign($$runtime, global.runtimeVariables);

  $$runtime.prepare();

  setResult({ value: $$runtime.evaluate() });
`;

export async function updateCalculatedFields(record: Record) {
  let sandbox = null;

  try {
    sandbox = new Sandbox({ template: EXPRESSIONS });

    await updateCalculatedFieldsRecursive(sandbox, record, record, record.form);
  } finally {
    if (sandbox) {
      await sandbox.shutdown();
    }
  }
}

export async function updateCalculatedFieldsRecursive(sandbox: Sandbox, record: Record, feature: Feature, container: ContainerElement) {
  const expressions = container.elementsOfType('CalculatedField', false).map(((field) => ({
    key: field.key,
    dataName: field.dataName,
    expression: field.expression,
  })));

  const runtimeVariables = {
    expressions,
    form: record.form.toJSON(),
    values: record.formValues.toJSON(),

    locale: 'en-US',
    language: 'en-US',
    timeZone: null,
    decimalSeparator: '.',
    groupingSeparator: ',',
    currencySymbol: '$',
    currencyCode: 'USD',
    country: 'US',
    deviceIdentifier: null,
    deviceModel: null,
    deviceManufacturer: null,
    platform: 'cli',
    platformVersion: '1.0.0',
    application: 'Fulcrum CLI',
    applicationVersion: '1.0.0',
    applicationBuild: '',
    userEmail: null,
    userRoleName: null,
    recordStatus: record.status,
    recordSystemCreatedAt: record.createdAt,
    recordSystemUpdatedAt: record.updatedAt,
    recordClientCreatedAt: record.clientCreatedAt,
    recordClientUpdatedAt: record.clientUpdatedAt,
    recordProject: record.projectID,
    recordProjectName: null,
    recordGeometry: null,
    recordAltitude: record.altitude,
    // recordVerticalAccuracy: data.recordVerticalAccuracy,
    // recordHorizontalAccuracy: data.recordHorizontalAccuracy,
    featureCreatedAt: null, // item.createdAt,
    featureUpdatedAt: null, // item.updatedAt,
    featureGeometry: null,
    featureIndex: feature.index,
  };

  const { value, error } = await sandbox.execute({
    code: SCRIPT,
    globals: { runtimeVariables },
    timeout: 1000,
  });

  for (const result of value) {
    if (result.type === 'calculation' && !result.error) {
      const element = record.form.get(result.key);

      const formValue = feature.formValues.createValue(element, result.value);

      console.log('setting value from', feature.formValues.get(element.key).textValue, 'to', formValue.textValue);

      feature.formValues.set(element, formValue);
    }
  }

  for (const formValue of feature.formValues.all) {
    if (formValue instanceof RepeatableValue) {
      for (const item of formValue.items) {
        await updateCalculatedFieldsRecursive(sandbox, record, item, formValue.element);
      }
    }
  }
}
