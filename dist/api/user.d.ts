import Resource from './resource';
export default class User extends Resource {
    get resourceName(): string;
    get resourcesName(): string;
    find(): Promise<any>;
}
