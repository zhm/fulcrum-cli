// @ts-nocheck

import MediaResource from './media-resource';

export default class Signature extends MediaResource {
  get defaultContentType() {
    return 'image/png';
  }

  get resourceName() {
    return 'signature';
  }

  get resourcesName() {
    return 'signatures';
  }

  large(id, callback) {
    return this.downloadVersion(id, 'large', callback);
  }

  largeURL(id) {
    return this.client.url(this.memberAction(id, 'large', 'png'));
  }

  thumbnail(id, callback) {
    return this.downloadVersion(id, 'thumbnail', callback);
  }

  thumbnailURL(id) {
    return this.client.url(this.memberAction(id, 'thumbnail', 'png'));
  }
}
