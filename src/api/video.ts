// @ts-nocheck

import MediaResource from './media-resource';

export default class Video extends MediaResource {
  get defaultContentType() {
    return 'video/mp4';
  }

  get resourceName() {
    return 'video';
  }

  get resourcesName() {
    return 'videos';
  }

  get createAction() {
    return 'videos/upload';
  }

  async uploadTrack(file, attributes, progress) {
    const options = {
      method: 'POST',
      path: this.createAction,
      fields: {},
      files: {},
    };

    options.fields['video[access_key]'] = attributes.access_key;
    options.files['video[track]'] = file;

    options.progress = progress;

    const body = await this.call(options);

    return JSON.parse(body)[this.resourceName];
  }

  videoURL(id) {
    return this.member(id, 'mp4');
  }

  largeURL(id) {
    return this.client.url(this.memberAction(id, 'thumbnail_large', 'jpg'));
  }

  thumbnail(id, callback) {
    return this.downloadVersion(id, 'thumbnail_medium_square', callback);
  }

  async track(id) {
    const body = await this.call({ path: this.trackURL(id, 'json') });

    return JSON.parse(body);
  }

  trackURL(id, format) {
    return this.memberAction(id, 'track', format);
  }

  thumbnailURL(id) {
    return this.client.url(this.memberAction(id, 'thumbnail_medium_square', 'jpg'));
  }
}
