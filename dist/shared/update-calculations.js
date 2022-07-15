"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCalculationsRecursive = exports.updateCalculations = exports.shutdownSandbox = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const fulcrum_core_1 = require("fulcrum-core");
const v8_sandbox_1 = require("v8-sandbox");
const log_1 = require("./log");
const EXPRESSIONS = fs_1.default.readFileSync(path_1.default.join(__dirname, '..', '..', 'resources', 'expressions.js')).toString();
const SCRIPT = `
  Object.assign($$runtime, global.runtimeVariables);

  $$runtime.prepare();

  setResult({ value: $$runtime.evaluate() });
`;
let globalSandbox = null;
function getSandbox() {
    if (!globalSandbox) {
        globalSandbox = new v8_sandbox_1.SandboxCluster({ workers: 2, template: EXPRESSIONS });
    }
    return globalSandbox;
}
async function shutdownSandbox() {
    if (globalSandbox) {
        await globalSandbox.shutdown();
    }
}
exports.shutdownSandbox = shutdownSandbox;
async function updateCalculations(record, context) {
    console.log('updating calculations for record', record.id);
    await updateCalculationsRecursive(record, record, record.formValues, context);
}
exports.updateCalculations = updateCalculations;
function environmentFromEnvironmentVariables() {
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
async function updateCalculationsRecursive(record, feature, formValues, context) {
    const runtimeVariables = getFeatureVariables(record, feature, formValues, context, environmentFromEnvironmentVariables());
    const { value, error } = await getSandbox().execute({
        code: SCRIPT,
        globals: { runtimeVariables },
        timeout: 2000,
    });
    for (const result of value) {
        if (result.type === 'calculation' && !result.error) {
            const element = record.form.get(result.key);
            const formValue = feature.formValues.createValue(element, result.value);
            console.log('record', (0, log_1.blue)(record.id), 'updating calculation', (0, log_1.blue)(element.dataName), 'from', (0, log_1.red)(feature.formValues.get(element.key)?.textValue ?? '[Blank]'), 'to', (0, log_1.green)(formValue.textValue));
            feature.formValues.set(element.key, formValue);
        }
    }
    for (const formValue of feature.formValues.all) {
        if (formValue instanceof fulcrum_core_1.RepeatableValue) {
            for (const item of formValue.items) {
                const itemValues = item.formValues.copy();
                itemValues.merge(formValues);
                await updateCalculationsRecursive(record, item, itemValues, context);
            }
        }
    }
}
exports.updateCalculationsRecursive = updateCalculationsRecursive;
const DEFAULT_ENVIRONMENT = {
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
function getFeatureVariables(record, feature, formValues, context, environment) {
    const repeatable = feature instanceof fulcrum_core_1.RepeatableItemValue ? feature.element : null;
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
        featureCreatedAt: fulcrum_core_1.DateUtils.formatEpochTimestamp(feature.createdAt),
        featureUpdatedAt: fulcrum_core_1.DateUtils.formatEpochTimestamp(feature.updatedAt),
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
//# sourceMappingURL=update-calculations.js.map