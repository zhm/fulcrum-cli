import Core from 'fulcrum-core';
import { SandboxCluster } from 'v8-sandbox';
import { Context } from './api';

import EXPRESSIONS from '../../resources/expressions.json';
import { log } from '../utils/logger';

const SCRIPT = `
  Object.assign($$runtime, global.runtimeVariables);

  $$runtime.prepare();

  setResult({ value: $$runtime.evaluate() });
`;

let globalSandbox = null;

function getSandbox() {
  if (!globalSandbox) {
    globalSandbox = new SandboxCluster({ workers: 4, template: EXPRESSIONS });
  }
  return globalSandbox;
}

export async function shutdownSandbox() {
  if (globalSandbox) {
    await globalSandbox.shutdown();
  }
}

export async function updateCalculations(record: Core.Record, context: Context) {
  log.info('updating calculations for record', record.id);

  await updateCalculationsRecursive(record, record, record.formValues, context);
}

function environmentFromEnvironmentVariables(): ExpressionEnvironment {
  const { env } = process;

  return {
    ...(env.FULCRUM_LOCALE ? { locale: env.FULCRUM_LOCALE } : {}),
    ...(env.FULCRUM_LANGUAGE ? { language: env.FULCRUM_LANGUAGE } : {}),
    ...(env.FULCRUM_TIMEZONE ? { timeZone: env.FULCRUM_TIMEZONE } : {}),
    ...(env.FULCRUM_DECIMAL_SEPARATOR ? { decimalSeparator: env.FULCRUM_DECIMAL_SEPARATOR } : {}),
    ...(env.FULCRUM_GROUPING_SEPARATOR ? {
      groupingSeparator: env.FULCRUM_GROUPING_SEPARATOR,
    } : {}),
    ...(env.FULCRUM_CURRENCY_SYMBOL ? { currencySymbol: env.FULCRUM_CURRENCY_SYMBOL } : {}),
    ...(env.FULCRUM_GROUPING_CODE ? { currencyCode: env.FULCRUM_GROUPING_CODE } : {}),
    ...(env.FULCRUM_COUNTRY ? { currencyCode: env.FULCRUM_COUNTRY } : {}),
  };
}

export async function updateCalculationsRecursive(
  record: Core.Record,
  feature: Core.Feature,
  formValues: Core.FormValues,
  context: Context,
) {
  const runtimeVariables = getFeatureVariables(
    record,
    feature,
    formValues,
    context,
    environmentFromEnvironmentVariables(),
  );

  const { value, error } = await getSandbox().execute({
    code: SCRIPT,
    globals: { runtimeVariables },
    timeout: 2000,
  });

  if (error) {
    log.error('record', record.id, 'error evaluating calculations', error);
  }

  for (const result of value) {
    if (result.type === 'calculation' && !result.error) {
      const element = record.form.get(result.key);

      const formValue = feature.formValues.createValue(element, result.value);
      const currentValue = feature.formValues.get(element.key);

      if (!currentValue || !formValue.isEqual(currentValue.textValue)) {
        log.info(
          'record',
          record.id,
          'updating calculation',
          element.dataName,
          'from',
          currentValue?.textValue ?? '[Blank]',
          'to',
          formValue.textValue,
        );

        feature.formValues.set(element.key, formValue);
      }
    }
  }

  for (const formValue of feature.formValues.all) {
    if (formValue instanceof Core.RepeatableValue) {
      for (const item of formValue.items) {
        const itemValues = item.formValues.copy();

        itemValues.merge(formValues);

        await updateCalculationsRecursive(record, item, itemValues, context);
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

function getFeatureVariables(
  record: Core.Record,
  feature: Core.Feature,
  formValues: Core.FormValues,
  context: Context,
  environment: ExpressionEnvironment,
) {
  const repeatable = feature instanceof Core.RepeatableItemValue ? feature.element : null;
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
    featureCreatedAt: Core.DateUtils.formatEpochTimestamp(feature.createdAt),
    featureUpdatedAt: Core.DateUtils.formatEpochTimestamp(feature.updatedAt),
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
