import Resource from './resource';
export default class Changeset extends Resource {
    get resourceName(): string;
    get resourcesName(): string;
    close(id: any, callback: any): any;
}
