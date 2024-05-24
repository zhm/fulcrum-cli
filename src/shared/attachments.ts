import fs from 'fs';
import { filesize } from 'filesize';
import { fileFromPath } from 'formdata-node/file-from-path';
import Client from '../api/client';
import { green, blue, red } from './log';
import { batch, withDownloadedFile } from './api';

export async function deleteAttachmentsByName(
  client: Client,
  formID: string,
  name: string,
) {
  const attachments = await client.attachments.all({ owner_type: 'form', form_id: formID });

  const existing = attachments.objects.filter((attachment) => attachment.name === name);

  await batch(existing, async (attachment) => {
    console.log('deleting attachment', blue(name), green(attachment.id));

    return client.attachments.delete(attachment.id);
  });
}

export async function duplicateMedia(
  type: string,
  mediaID: string,
  find: (id: string) => Promise<any>,
  create: (file: any, attributes: any) => Promise<any>,
) {
  const object = await find(mediaID);

  return withDownloadedFile(object.original, async (filePath) => {
    const file = await fileFromPath(filePath);

    const newObject = await create(file, {});

    console.log('created', type, blue(newObject.access_key));

    return newObject;
  });
}

export async function duplicatePhoto(client: Client, mediaID: string) {
  return duplicateMedia(
    'photo',
    mediaID,
    (id) => client.photos.find(id),
    (file, attributes) => client.photos.create(file, attributes),
  );
}

export async function duplicateAudio(client: Client, mediaID: string) {
  return duplicateMedia(
    'audio',
    mediaID,
    (id) => client.audio.find(id),
    (file, attributes) => client.audio.create(file, attributes),
  );
}

export async function duplicateVideo(client: Client, mediaID: string) {
  return duplicateMedia(
    'video',
    mediaID,
    (id) => client.videos.find(id),
    (file, attributes) => client.videos.create(file, attributes),
  );
}

export async function duplicateSignature(client: Client, mediaID: string) {
  return duplicateMedia(
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

  console.log('creating attachment', blue(name), red(filesize(attachment.file_size)));

  return client.attachments.create(attachment, filePath);
}

export async function duplicateReferenceFiles(
  client: Client,
  sourceFormID: string,
  destinationFormID: string,
) {
  const attachments = await client.attachments.all({ owner_type: 'form', form_id: sourceFormID });

  await batch(attachments.objects, async (attachment) => {
    await withDownloadedFile(attachment.url, async (filePath) => {
      await createAttachment(client, destinationFormID, filePath, attachment.name);
    });
  });
}
