import Resource from './resource';
export default class View extends Resource {
    get resourceName(): string;
    get resourcesName(): string;
}
