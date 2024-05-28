import fs from 'fs';
import path from 'path';
import Namer from './namer';

const MAX_FILE_LENGTH = 200;

async function fileExists(directory: string, name: string) {
  try {
    await fs.promises.stat(path.join(directory, name));
    return true;
  } catch (error) {
    return false;
  }
}

async function generateFileName(name: string, number: number, maxLength: number): Promise<string> {
  const parts = path.parse(name);

  const suffix = number === 0 ? '' : ` (${number})`;

  const trimmedName = parts.name.substring(0, maxLength - suffix.length + parts.ext.length);

  return trimmedName + suffix + parts.ext;
}

export default class FileNamer extends Namer {
  directory: string;

  constructor({
    directory,
  }: {
    directory: string,
  }) {
    super({
      maxLength: MAX_FILE_LENGTH,
      nameExists: (name) => fileExists(directory, name),
      nameFormatter: (name, number, maxLength) => generateFileName(name, number, maxLength),
    });

    this.directory = directory;
  }
}
