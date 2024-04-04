// @ts-nocheck

import Resource from './resource';
import List from './actions/list';
import { ListResponse } from './types';
import applyMixins from '../utils/mixin';

export interface WorkflowExecution {
  id: string;
  record_id: string;
  status: 'in_progress' | 'filtered' | 'success' | 'error' | 'rate_limited';
  error: null | 'string';
  created_at: string;
  updated_at: string;
  event_type: string;
}

export type WorkflowExecutionListResponse = ListResponse<WorkflowExecution>;

export interface Params {
  workflow_id: string;
  order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
  start_date?: string;
  end_date?: string;
}

export default class WorkflowExecutionResource extends Resource {
  get resourceName() {
    return 'workflow_execution';
  }

  get resourcesName() {
    return 'workflow_executions';
  }
}

interface WorkflowExecutionResource extends List {}
applyMixins(WorkflowExecutionResource, [List]);
