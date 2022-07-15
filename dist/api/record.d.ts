import Resource from './resource';
import Page from './page';
export default class Record extends Resource {
    get resourceName(): string;
    get resourcesName(): string;
    delete(id: any, changesetID: any): any;
    history(params: any): Promise<Page>;
    query(params: any): Promise<Page>;
}
