import MediaResource from './media-resource';
export default class Photo extends MediaResource {
    get defaultContentType(): string;
    get resourceName(): string;
    get resourcesName(): string;
    large(id: any, callback: any): Promise<any>;
    largeURL(id: any): any;
    thumbnail(id: any, callback: any): Promise<any>;
    thumbnailURL(id: any): any;
}
