const MAX_ITERATIONS = 100;

export type NameChecker = (name: string) => Promise<boolean>;
export type NameFormatter = (name: string, number: number, maxLength: number) => Promise<string>;

export default class Namer {
  private maxLength: number;

  private nameExists: NameChecker;

  private nameFormatter: NameFormatter;

  constructor({
    maxLength,
    nameExists,
    nameFormatter,
  }: {
    maxLength?: number,
    nameExists: NameChecker,
    nameFormatter?: NameFormatter,
  }) {
    this.maxLength = maxLength ?? 1e10;
    this.nameExists = nameExists;
    this.nameFormatter = nameFormatter;
  }

  async getName(name) {
    for (let iteration = 0; iteration < MAX_ITERATIONS; ++iteration) {
      const candidate = await this.nameFormatter(name, iteration, this.maxLength);

      if (candidate.length > this.maxLength) {
        throw Error('Name too long');
      }

      if (!(await this.nameExists(candidate))) {
        return candidate;
      }
    }

    throw Error(`Unable to generate a unique name: ${name}`);
  }

  async formatName(name: string, number: number, maxLength: number): Promise<string> {
    const suffix = number === 0 ? number.toString() : `_${number}`;

    return name.substring(0, maxLength - suffix.length) + suffix;
  }
}
