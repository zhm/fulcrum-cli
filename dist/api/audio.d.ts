import MediaResource from './media-resource';
export default class Audio extends MediaResource {
    get defaultContentType(): string;
    get resourceName(): string;
    get resourcesName(): string;
    get createAction(): string;
    uploadTrack(file: any, attributes: any, progress: any): Promise<any>;
    track(id: any): any;
    audioURL(id: any): string;
    trackURL(id: any, format: any): string;
}
