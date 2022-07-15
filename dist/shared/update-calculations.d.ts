import { Record, Feature, FormValues } from 'fulcrum-core';
import { Context } from './api';
export declare function shutdownSandbox(): Promise<void>;
export declare function updateCalculations(record: Record, context: Context): Promise<void>;
export declare function updateCalculationsRecursive(record: Record, feature: Feature, formValues: FormValues, context: Context): Promise<void>;
