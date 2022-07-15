import Resource from './resource';
export default class Form extends Resource {
    get resourceName(): string;
    get resourcesName(): string;
    systemApps(): Promise<any>;
}
