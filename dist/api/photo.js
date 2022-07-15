"use strict";
// @ts-nocheck
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const media_resource_1 = __importDefault(require("./media-resource"));
class Photo extends media_resource_1.default {
    get defaultContentType() {
        return 'image/jpeg';
    }
    get resourceName() {
        return 'photo';
    }
    get resourcesName() {
        return 'photos';
    }
    large(id) {
        return this.downloadVersion(id, 'large');
    }
    largeURL(id) {
        return this.client.url(this.memberAction(id, 'large', 'jpg'));
    }
    thumbnail(id) {
        return this.downloadVersion(id, 'thumbnail');
    }
    thumbnailURL(id) {
        return this.client.url(this.memberAction(id, 'thumbnail', 'jpg'));
    }
}
exports.default = Photo;
//# sourceMappingURL=photo.js.map