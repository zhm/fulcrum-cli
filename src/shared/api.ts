import axios from 'axios';
import { chunk } from 'lodash';
import {
  Form, Record, RepeatableItemValue,
  RepeatableValue, Feature, DateUtils,
  User, Role, FormValues, Changeset,
} from 'fulcrum-core';
import fs from 'fs';
import path from 'path';
import Sandbox from 'v8-sandbox';
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
  return new Form(await client.forms.find(id));
}

export async function fetchRecordsBySQL(client: Client, form: Form, sql: string) {
  const result = await client.query.run({ q: sql });

  const ids = result.objects.map((o) => o._record_id ?? o.record_id ?? o.id);

  const records = [];

  for (const id of ids) {
    const record = new Record(await client.records.find(id), form);

    if (record.projectID) {
      const project = await client.projects.find(record.projectID);

      record.project = project;
    }

    records.push(record);
  }

  return records;
}

const EXPRESSIONS = fs.readFileSync(path.join(__dirname, '..', '..', 'resources', 'expressions.js')).toString();

const SCRIPT = `
  Object.assign($$runtime, global.runtimeVariables);

  $$runtime.prepare();

  setResult({ value: $$runtime.evaluate() });
`;

export async function updateCalculatedFields(record: Record, context: Context) {
  let sandbox = null;

  try {
    sandbox = new Sandbox({ template: EXPRESSIONS });

    await updateCalculatedFieldsRecursive(sandbox, record, record, record.formValues, context);
  } finally {
    if (sandbox) {
      await sandbox.shutdown();
    }
  }
}

function environmentFromEnvironmentVariables(): ExpressionEnvironment {
  const { env } = process;

  return {
    ...(env.FULCRUM_LOCALE ? { locale: env.FULCRUM_LOCALE } : {}),
    ...(env.FULCRUM_LANGUAGE ? { language: env.FULCRUM_LANGUAGE } : {}),
    ...(env.FULCRUM_TIMEZONE ? { timeZone: env.FULCRUM_TIMEZONE } : {}),
    ...(env.FULCRUM_DECIMAL_SEPARATOR ? { decimalSeparator: env.FULCRUM_DECIMAL_SEPARATOR } : {}),
    ...(env.FULCRUM_GROUPING_SEPARATOR ? { groupingSeparator: env.FULCRUM_GROUPING_SEPARATOR } : {}),
    ...(env.FULCRUM_CURRENCY_SYMBOL ? { currencySymbol: env.FULCRUM_CURRENCY_SYMBOL } : {}),
    ...(env.FULCRUM_GROUPING_CODE ? { currencyCode: env.FULCRUM_GROUPING_CODE } : {}),
    ...(env.FULCRUM_COUNTRY ? { currencyCode: env.FULCRUM_COUNTRY } : {}),
  };
}

export async function updateCalculatedFieldsRecursive(sandbox: Sandbox, record: Record, feature: Feature, formValues: FormValues, context: Context) {
  const runtimeVariables = getFeatureVariables(record, feature, formValues, context, environmentFromEnvironmentVariables());

  const { value, error } = await sandbox.execute({
    code: SCRIPT,
    globals: { runtimeVariables },
    timeout: 1000,
  });

  for (const result of value) {
    if (result.type === 'calculation' && !result.error) {
      const element = record.form.get(result.key);

      const formValue = feature.formValues.createValue(element, result.value);

      console.log(
        'record',
        blue(record.id),
        'updating calculation',
        blue(element.dataName),
        'from',
        red(feature.formValues.get(element.key)?.textValue ?? '[Blank]'),
        'to',
        green(formValue.textValue),
      );

      feature.formValues.set(element.key, formValue);
    }
  }

  for (const formValue of feature.formValues.all) {
    if (formValue instanceof RepeatableValue) {
      for (const item of formValue.items) {
        const itemValues = item.formValues.copy();

        itemValues.merge(formValues);

        await updateCalculatedFieldsRecursive(sandbox, record, item, itemValues, context);
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

function getFeatureVariables(record: Record, feature: Feature, formValues: FormValues, context: Context, environment: ExpressionEnvironment) {
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
    values: formValues.toJSON(),
    repeatable: repeatable?.key ?? null,

    userEmail: context.user.email,
    userFullName: context.user.fullName,
    userRoleName: context.role.name,

    recordID: record.id,
    recordStatus: record.status,
    recordClientCreatedAt: record.clientCreatedAt,
    recordClientUpdatedAt: record.clientUpdatedAt,
    recordProject: record.projectID,
    recordProjectName: record.projectName,
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

export async function createChangeset(client: Client, form: Form, comment?: string) {
  console.log('creating changeset', blue(form.id), green(comment));

  const json = await client.changesets.create(buildChangesetAttributes(form, comment));

  return new Changeset(json);
}

export async function closeChangeset(client: Client, changeset: Changeset) {
  console.log('closing changeset', blue(changeset.id));
  return client.changesets.close(changeset.id);
}

export async function saveRecord(client: Client, record: Record, changeset?: Changeset) {
  record.changeset = changeset;

  console.log('syncing record', blue(record.id));

  const json = await client.records.create(record.toJSON());

  record.updateFromAPIAttributes(json);

  return record;
}

export async function saveRecords(client: Client, form: Form, records: Record[], comment?: string) {
  const changeset = await createChangeset(client, form, comment);

  for (const batch of chunk(records, 5)) {
    console.log('syncing batch');
    await Promise.all(batch.map((record) => saveRecord(client, record, changeset)));
  }

  await closeChangeset(client, changeset);
}
