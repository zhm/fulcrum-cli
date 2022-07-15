import Resource from './resource';
import Page from './page';
export default class Query extends Resource {
    ast(params: any): Promise<any>;
    run(params: any): Promise<Page>;
    queryRecords({ q }: {
        q: any;
    }): Promise<any>;
}
