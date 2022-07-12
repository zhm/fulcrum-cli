import MediaResource from './media-resource';

export default class Attachment extends MediaResource {
  get defaultContentType() {
    return '';
  }

  get resourceName() {
    return 'attachment';
  }

  get resourcesName() {
    return 'attachments';
  }
}
