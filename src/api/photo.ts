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

  large(id) {
    return this.downloadVersion(id, 'large');
  }

  largeURL(id) {
    return this.client.url(this.memberAction(id, 'large', 'jpg'));
  }

  thumbnail(id) {
    return this.downloadVersion(id, 'thumbnail');
  }

  thumbnailURL(id) {
    return this.client.url(this.memberAction(id, 'thumbnail', 'jpg'));
  }
}
