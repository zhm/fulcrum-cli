import Resource from './resource';
import { ListResponse } from './types';
export interface WorkflowExecution {
    id: string;
    record_id: string;
    status: 'in_progress' | 'filtered' | 'success' | 'error' | 'rate_limited';
    error: null | 'string';
    created_at: string;
    updated_at: string;
    event_type: string;
}
export declare type WorkflowExecutionListResponse = ListResponse<WorkflowExecution>;
export interface Params {
    workflow_id: string;
    order?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
    start_date?: string;
    end_date?: string;
}
export default class WorkflowExecutionResource extends Resource {
    get resourceName(): string;
    get resourcesName(): string;
}
