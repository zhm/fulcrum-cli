// @ts-nocheck

export default class Resource {
  constructor(client) {
    this.client = client;
  }

  call(options) {
    return this.client.call(options);
  }

  ext(format) {
    return format ? `.${format}` : '';
  }

  collection(format) {
    return `${this.resourcesName}${this.ext(format)}`;
  }

  collectionAction(name, format: string | null) {
    return `${this.resourcesName}/${name}${this.ext(format)}`;
  }

  member(id, format) {
    return `${this.resourcesName}/${id}${this.ext(format)}`;
  }

  memberAction(id, action, format) {
    return `${this.resourcesName}/${id}/${action}${this.ext(format)}`;
  }

  attributesForObject(object) {
    const attributes = {};
    attributes[this.resourceName] = object;
    return attributes;
  }
}
