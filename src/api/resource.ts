// @ts-nocheck

export default class Resource {
  constructor(client) {
    this.client = client;
  }

  call(options) {
    return this.client.call(options);
  }

  modifier(name, format = 'json') {
    return `${name}.${format}`;
  }

  collection(format = 'json') {
    return `${this.resourcesName}.${format}`;
  }

  collectionAction(name, format: string | null = 'json') {
    if (format != null) {
      return `${this.resourcesName}/${name}.${format}`;
    }
    return `${this.resourcesName}/${name}`;
  }

  member(id, format = 'json') {
    return `${this.resourcesName}/${id}.${format}`;
  }

  memberAction(id, action, format = 'json') {
    if (format != null) {
      return `${this.resourcesName}/${id}/${action}.${format}`;
    }

    return `${this.resourcesName}/${id}/${action}`;
  }

  attributesForObject(object) {
    const attributes = {};
    attributes[this.resourceName] = object;
    return attributes;
  }
}
