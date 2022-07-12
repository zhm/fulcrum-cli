import Resource from './resource';
export default class Project extends Resource {
    get resourceName(): string;
    get resourcesName(): string;
}
