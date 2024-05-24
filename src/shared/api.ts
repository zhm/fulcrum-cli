import http from 'http';
import axios from 'axios';
import path from 'path';
import fs from 'fs';
import queue from 'async/queue';
import Core from 'fulcrum-core';
import { mkdirp } from 'mkdirp';
import { randomUUID } from 'crypto';
import Client from '../api/client';
import { red } from './log';

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
      console.error(red('error'), ex.message);
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
    base: `${endpoint}/api/v2`,
    config: {
      query_url: endpoint,
    },
    token,
    request,
    userAgent: 'Fulcrum CLI',
  });
}

export async function fetchContext(client: Client): Promise<Context> {
  console.log('fetching context');

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

export async function download(url, outputFileName) {
  return new Promise(async (resolve, reject) => {
    const destStream = fs.createWriteStream(outputFileName);

    try {
      const config = {
        method: 'GET',
        url,
        responseType: 'stream',
        headers: {},
      };

      await axios(config)
        .then((res) => new Promise((resolve, reject) => {
          res.data.pipe(destStream);
          destStream
            .on('error', (err) => {
              reject({ response: { statusText: err.message } }); // Use same shape as axios error
            })
            .on('close', () => {
              resolve();
            });
        }));

      resolve();
    } catch (err) {
      destStream.close();
      reject(err);
    }
  });
}

export async function withDownloadedFile(
  url: string,
  process: (filePath: string) => Promise<any>,
): Promise<any> {
  let filePath = null;

  try {
    filePath = await downloadFile(url);

    const result = await process(filePath);

    return result;
  } finally {
    if (filePath) {
      await fs.promises.unlink(filePath);
    }
  }
}

export async function downloadFile(
  url: string,
) {
  await mkdirp('tmp');

  const downloadPath = path.join('tmp', randomUUID());

  await download(url, downloadPath);

  return downloadPath;
}
