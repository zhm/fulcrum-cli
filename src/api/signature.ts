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

  large(id) {
    return this.downloadVersion(id, 'large');
  }

  largeURL(id) {
    return this.client.url(this.memberAction(id, 'large', 'png'));
  }

  thumbnail(id) {
    return this.downloadVersion(id, 'thumbnail');
  }

  thumbnailURL(id) {
    return this.client.url(this.memberAction(id, 'thumbnail', 'png'));
  }
}
