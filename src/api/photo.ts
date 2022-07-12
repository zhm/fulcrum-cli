// @ts-nocheck

import MediaResource from './media-resource';

export default class Photo extends MediaResource {
  get defaultContentType() {
    return 'image/jpeg';
  }

  get resourceName() {
    return 'photo';
  }

  get resourcesName() {
    return 'photos';
  }

  large(id, callback) {
    return this.downloadVersion(id, 'large', callback);
  }

  largeURL(id) {
    return this.client.url(this.memberAction(id, 'large', 'jpg'));
  }

  thumbnail(id, callback) {
    return this.downloadVersion(id, 'thumbnail', callback);
  }

  thumbnailURL(id) {
    return this.client.url(this.memberAction(id, 'thumbnail', 'jpg'));
  }
}
