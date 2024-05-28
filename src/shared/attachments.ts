import fs from 'fs';
import { filesize } from 'filesize';
import { fileFromPath } from 'formdata-node/file-from-path';
import Client from '../api/client';
import { batch } from './api';
import { log } from '../utils/logger';

export async function deleteAttachmentsByName(
  client: Client,
  formID: string,
  name: string,
) {
  const attachments = await client.attachments.all({ owner_type: 'form', form_id: formID });

  const existing = attachments.objects.filter((attachment) => attachment.name === name);

  await batch(existing, async (attachment) => {
    log.info('deleting attachment', name, attachment.id);

    return client.attachments.delete(attachment.id);
  });
}

export async function duplicateMedia(
  client: Client,
  type: string,
  mediaID: string,
  find: (id: string) => Promise<any>,
  create: (file: any, attributes: any) => Promise<any>,
) {
  const object = await find(mediaID);

  return client.withDownloadedFile({ url: object.original }, async (result) => {
    const file = await fileFromPath(result.outputFilePath);

    const newObject = await create(file, {});

    log.info('created', type, newObject.access_key);

    return newObject;
  });
}

export async function duplicatePhoto(client: Client, mediaID: string) {
  return duplicateMedia(
    client,
    'photo',
    mediaID,
    (id) => client.photos.find(id),
    (file, attributes) => client.photos.create(file, attributes),
  );
}

export async function duplicateAudio(client: Client, mediaID: string) {
  return duplicateMedia(
    client,
    'audio',
    mediaID,
    (id) => client.audio.find(id),
    (file, attributes) => client.audio.create(file, attributes),
  );
}

export async function duplicateVideo(client: Client, mediaID: string) {
  return duplicateMedia(
    client,
    'video',
    mediaID,
    (id) => client.videos.find(id),
    (file, attributes) => client.videos.create(file, attributes),
  );
}

export async function duplicateSignature(client: Client, mediaID: string) {
  return duplicateMedia(
    client,
    'signature',
    mediaID,
    (id) => client.signatures.find(id),
    (file, attributes) => client.signatures.create(file, attributes),
  );
}

export async function createAttachment(
  client: Client,
  formID: string,
  filePath: string,
  name: string,
) {
  const attachment = {
    name,
    owners: [{ type: 'form', id: formID }],
    file_size: (await fs.promises.stat(filePath)).size,
    metadata: {
      filename: name,
    },
  };

  log.info('creating attachment', name, filesize(attachment.file_size));

  return client.attachments.create(attachment, filePath);
}

export async function duplicateReferenceFiles(
  client: Client,
  sourceFormID: string,
  destinationFormID: string,
) {
  const attachments = await client.attachments.all({ owner_type: 'form', form_id: sourceFormID });

  await batch(attachments.objects, async (attachment) => {
    log.info('duplicating attachment', attachment.name, filesize(attachment.file_size));

    await client.withDownloadedFile({ url: attachment.url }, async (result) => {
      await createAttachment(client, destinationFormID, result.outputFilePath, attachment.name);
    });
  });
}
