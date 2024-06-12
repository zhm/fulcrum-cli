// @ts-nocheck

import List from './actions/list';
import Find from './actions/find';
import Create from './actions/create';
import Resource from './resource';
import applyMixins from '../utils/mixin';
import { FileDownloadProcessor } from './client';

export type ReportGenerationProcessor = (path: string) => Promise<void>;

export default class Report extends Resource {
  get resourceName() {
    return 'report';
  }

  get resourcesName() {
    return 'reports';
  }

  async generate(recordID: string, reportTemplateID: string, process: FileDownloadProcessor) {
    const url = this.client.urlFromPath(this.collectionAction('generate'));

    const options = {
      url,
      method: 'POST',
      headers: this.client.apiHeaders,
      data: {
        report: {
          record_id: recordID,
          template_id: reportTemplateID,
        },
      },
    };

    return this.client.withDownloadedFile(options, process);
  }
}

interface Report extends List, Find, Create {}
applyMixins(Report, [List, Find, Create]);
