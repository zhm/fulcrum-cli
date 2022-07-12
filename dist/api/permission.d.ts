import Resource from './resource';
export default class Permission extends Resource {
    get resourceName(): string;
    get resourcesName(): string;
    formMembers(formId: any): Promise<any>;
}
