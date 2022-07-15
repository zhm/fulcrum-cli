import { Form, Record, User, Role, Changeset } from 'fulcrum-core';
import Client from '../api/client';
export interface Organization {
    id: string;
    name: string;
}
export interface Context {
    user: User;
    role: Role;
    organization: Organization;
}
export declare type BatchOperationCallback = (object: any) => Promise<void>;
export declare function batch(objects: any[], callback: BatchOperationCallback): Promise<void>;
export declare function createClient(endpoint: string, token: string): Client;
export declare function fetchContext(client: Client): Promise<Context>;
export declare function fetchForm(client: Client, id: string): Promise<any>;
export declare function fetchRecord(client: Client, id: string, form: Form): Promise<any>;
export declare function fetchRecordsBySQL(client: Client, form: Form, sql: string, where?: string): Promise<any[]>;
export declare function fetchChangeset(client: Client, id: string): Promise<any>;
export declare function createChangeset(client: Client, form: Form, comment?: string): Promise<any>;
export declare function closeChangeset(client: Client, changeset: Changeset): Promise<any>;
export declare function deleteRecord(client: Client, id: string, changeset?: Changeset): Promise<any>;
export declare function saveRecord(client: Client, record: Record, changeset?: Changeset): Promise<Record>;
export declare function saveRecords(client: Client, form: Form, records: Record[], comment?: string): Promise<void>;
export declare function deleteRecords(client: Client, form: Form, records: Record[], comment?: string): Promise<void>;
export interface RecordOperation {
    type: 'create' | 'update' | 'delete';
    id?: string;
    record?: Record;
}
export declare function executeRecordOperatons(client: Client, form: Form, operations: RecordOperation[], comment?: string): Promise<void>;
