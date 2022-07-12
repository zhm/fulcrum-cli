export default class Resource {
    constructor(client: any);
    call(options: any): any;
    modifier(name: any, format?: string): string;
    collection(format?: string): string;
    collectionAction(name: any, format?: string | null): string;
    member(id: any, format?: string): string;
    memberAction(id: any, action: any, format?: string): string;
    attributesForObject(object: any): {};
}
