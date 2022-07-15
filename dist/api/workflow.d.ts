import Resource from './resource';
export default class Workflow extends Resource {
    get resourceName(): string;
    get resourcesName(): string;
}
