import MediaResource from './media-resource';
export default class Attachment extends MediaResource {
    get defaultContentType(): string;
    get resourceName(): string;
    get resourcesName(): string;
}
