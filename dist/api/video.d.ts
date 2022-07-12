import MediaResource from './media-resource';
export default class Video extends MediaResource {
    get defaultContentType(): string;
    get resourceName(): string;
    get resourcesName(): string;
    get createAction(): string;
    uploadTrack(file: any, attributes: any, progress: any): Promise<any>;
    videoURL(id: any): string;
    largeURL(id: any): any;
    thumbnail(id: any, callback: any): Promise<any>;
    track(id: any): Promise<any>;
    trackURL(id: any, format: any): string;
    thumbnailURL(id: any): any;
}
