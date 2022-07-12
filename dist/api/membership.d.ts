import Resource from './resource';
export default class Membership extends Resource {
    get resourceName(): string;
    get resourcesName(): string;
    changePermissions(changes: any): Promise<any>;
}
