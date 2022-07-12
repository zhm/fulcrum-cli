import Mixin from 'mixmatch';
export default class History extends Mixin {
    history(id: string, params?: {}): Promise<any>;
}
