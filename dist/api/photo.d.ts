import MediaResource from './media-resource';
export default class Photo extends MediaResource {
    get defaultContentType(): string;
    get resourceName(): string;
    get resourcesName(): string;
    large(id: any): Promise<any>;
    largeURL(id: any): any;
    thumbnail(id: any): Promise<any>;
    thumbnailURL(id: any): any;
}
