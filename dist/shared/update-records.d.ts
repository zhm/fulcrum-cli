import { Record, Form } from 'fulcrum-core';
import { RecordOperation, Context } from './api';
import Client from '../api/client';
export declare type RecordOperationCallback = (record: Record) => Promise<RecordOperation | null>;
export declare function updateRecords(client: Client, form: Form, records: Record[], context: Context, comment?: string, callback?: RecordOperationCallback): Promise<void>;
export declare function updateRecordFields(client: Client, form: Form, records: Record[], context: Context, fields: string[], values: string[], comment?: string): Promise<void>;
