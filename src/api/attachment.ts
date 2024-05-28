import fs from 'fs';
import MediaResource from './media-resource';
import List from './actions/list';
import Find from './actions/find';
import Create from './actions/create';
import applyMixins from '../utils/mixin';
import Delete from './actions/delete';

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

  collection() {
    return this.resourcesName;
  }

  // list() {
  //   https://attachments.fulcrumapp.com/?form_id=6ca81299-5456-484f-a1b2-ac48d36ee300&owner_type=form
  // }

  get createAction() {
    return this.collection();
  }

  // find is inconsistent for attachments, it does not nest the object name
  async find(id, params = {}) {
    const options = {
      method: 'GET',
      path: this.member(id),
      params,
    };

    const json = await this.call(options);

    return json;
  }

  // create is inconsistent for attachments, it uses its own upload method
  async create(object, filePath) {
    const createOptions = {
      method: 'POST',
      path: this.collection(),
      data: object,
    };

    const json = await this.call(createOptions);

    const { id, url, headers } = json;

    const uploadOptions = {
      method: 'PUT',
      url,
      data: fs.createReadStream(filePath),
      headers: {
        ...headers,
        'Content-length': object.file_size,
      },
    };

    await this.client.executeRequest(uploadOptions);

    const finalizeOptions = {
      method: 'POST',
      path: this.collectionAction('finalize', null),
      data: { id },
    };

    await this.client.call(finalizeOptions);

    return this.find(id);
  }

  async delete(id) {
    const options = {
      method: 'DELETE',
      path: this.member(id),
    };

    await this.call(options);
  }
}

interface Attachment extends List {}

applyMixins(Attachment, [List]);
