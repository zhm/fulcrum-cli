import axios from 'axios';
import {
  Form, Record, RepeatableItemValue, RepeatableValue, Feature, DateUtils,
} from 'fulcrum-core';
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

    await updateCalculatedFieldsRecursive(sandbox, record, record);
  } finally {
    if (sandbox) {
      await sandbox.shutdown();
    }
  }
}

export async function updateCalculatedFieldsRecursive(sandbox: Sandbox, record: Record, feature: Feature) {
  const repeatable = feature instanceof RepeatableItemValue ? feature.element : null;
  const container = repeatable ?? record.form;

  const expressions = container.elementsOfType('CalculatedField', false).map(((field) => ({
    key: field.key,
    dataName: field.dataName,
    expression: field.expression,
  })));

  const runtimeVariables = getFeatureVariables(record, feature, {});

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
        await updateCalculatedFieldsRecursive(sandbox, record, item);
      }
    }
  }
}

interface ExpressionEnvironment {
  locale?: string;
  language?: string;
  timeZone?: string;
  decimalSeparator?: string;
  groupingSeparator?: string;
  currencySymbol?: string;
  currencyCode?: string;
  country?: string;
  deviceIdentifier?: string;
  deviceModel?: string;
  deviceManufacturer?: string;
  platform?: string;
  platformVersion?: string;
  application?: string;
  applicationVersion?: string;
  applicationBuild?: string;
}

const DEFAULT_ENVIRONMENT: ExpressionEnvironment = {
  locale: 'en_US',
  language: 'en-US',
  timeZone: 'America/New_York',
  decimalSeparator: '.',
  groupingSeparator: ',',
  currencySymbol: '$',
  currencyCode: 'USD',
  country: 'US',
  deviceIdentifier: 'Unknown',
  deviceModel: 'Unknown',
  deviceManufacturer: 'Unknown',
  platform: 'cli',
  platformVersion: '1.0.0',
  application: 'Fulcrum CLI',
  applicationVersion: '1.0.0',
  applicationBuild: '',
};

function getFeatureVariables(record: Record, feature: Feature, environment: ExpressionEnvironment) {
  const repeatable = feature instanceof RepeatableItemValue ? feature.element : null;
  const container = repeatable ?? record.form;

  const expressions = container.elementsOfType('CalculatedField', false).map(((field) => ({
    key: field.key,
    dataName: field.dataName,
    expression: field.expression,
  })));

  return {
    ...DEFAULT_ENVIRONMENT,
    ...environment,
    expressions,
    form: record.form.toJSON(),
    values: record.formValues.toJSON(),
    repeatable: repeatable?.key ?? null,

    userEmail: null,
    userFullName: null,
    userRoleName: null,

    recordID: record.id,
    recordStatus: record.status,
    recordClientCreatedAt: record.clientCreatedAt,
    recordClientUpdatedAt: record.clientUpdatedAt,
    recordProject: record.projectID,
    recordProjectName: null,
    recordGeometry: record.geometryAsGeoJSON,

    recordAltitude: record.altitude,
    recordVerticalAccuracy: record.recordVerticalAccuracy,
    recordHorizontalAccuracy: record.recordHorizontalAccuracy,

    recordCreatedLatitude: record.createdLatitude,
    recordCreatedLongitude: record.createdLongitude,
    recordCreatedAltitude: record.createdAltitude,
    recordCreatedAccuracy: record.createdAccuracy,

    recordUpdatedLatitude: record.updatedLatitude,
    recordUpdatedLongitude: record.updatedLongitude,
    recordUpdatedAltitude: record.updatedAltitude,
    recordUpdatedAccuracy: record.updatedAccuracy,

    recordCreatedDuration: record.createdDuration,
    recordUpdatedDuration: record.updatedDuration,
    recordEditedDuration: record.editedDuration,

    featureID: feature.id,
    featureIndex: feature.index,
    featureIsNew: feature.id == null,
    featureCreatedAt: DateUtils.formatEpochTimestamp(feature.createdAt),
    featureUpdatedAt: DateUtils.formatEpochTimestamp(feature.updatedAt),
    featureGeometry: feature.geometryAsGeoJSON,

    featureCreatedLatitude: feature.createdLatitude,
    featureCreatedLongitude: feature.createdLongitude,
    featureCreatedAltitude: feature.createdAltitude,
    featureCreatedAccuracy: feature.createdAccuracy,

    featureUpdatedLatitude: feature.updatedLatitude,
    featureUpdatedLongitude: feature.updatedLongitude,
    featureUpdatedAltitude: feature.updatedAltitude,
    featureUpdatedAccuracy: feature.updatedAccuracy,

    featureCreatedDuration: feature.createdDuration,
    featureUpdatedDuration: feature.updatedDuration,
    featureEditedDuration: feature.editedDuration,

    currentLocation: null,
  };
}
