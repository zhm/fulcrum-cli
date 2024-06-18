import http from 'http';
import axios from 'axios';
import queue from 'async/queue';
import Core from 'fulcrum-core';
import Client from '../api/client';
import { log } from '../utils/logger';

export interface Organization {
  id: string;
  name: string;
}
export interface Context {
  user: Core.User;
  role: Core.Role;
  organization: Organization;
}

export type BatchOperationCallback = (object: any) => Promise<any>;

export async function batch(objects: any[], callback: BatchOperationCallback) {
  const q = queue(async (task) => {
    try {
      await callback(task);
    } catch (ex) {
      log.error(ex.message);
    }
  }, process.env.FULCRUM_BATCH_SIZE ?? 15);

  q.push(objects);

  await q.drain();
}

export function createClient(endpoint: string, token: string) {
  const request = axios.create({
    httpAgent: new http.Agent({ keepAlive: true }),
  });

  return new Client({
    base: endpoint,
    config: {
      query_url: endpoint,
    },
    token,
    request,
    userAgent: 'Fulcrum CLI',
  });
}

export async function fetchContext(client: Client): Promise<Context> {
  log.info('fetching context');

  const json = await client.user.find();

  const user = new Core.User(json);

  const context = json.contexts.find((o) => o.id === json.current_organization.id);

  const role = new Core.Role(context.role);

  const organization = {
    id: context.id,
    name: context.name,
  };

  return { user, role, organization };
}
