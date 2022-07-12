import Mixin from 'mixmatch';
import Page from '../page';
export default class List extends Mixin {
    get defaultListParams(): {
        per_page: number;
    };
    all(params: any): Promise<Page>;
}
