import Resource from './resource';
export default class Role extends Resource {
    get resourceName(): string;
    get resourcesName(): string;
}
