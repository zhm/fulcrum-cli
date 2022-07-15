import Resource from './resource';
export default class MediaResource extends Resource {
    optionsForUpload(file: any, attributes: any): {
        method: string;
        path: any;
        fields: {};
        files: {};
    };
    create(file: any, attributes: any, progress: any): Promise<any>;
    downloadVersion(accessKey: any, version: any): Promise<any>;
    original(accessKey: any): void;
}
