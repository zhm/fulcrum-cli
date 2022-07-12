import Resource from './resource';
import Page from './page';
export default class Record extends Resource {
    get resourceName(): string;
    get resourcesName(): string;
    delete(id: any, changesetID: any, callback: any): any;
    query(params: any): Promise<Page>;
}
