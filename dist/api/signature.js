"use strict";
// @ts-nocheck
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const media_resource_1 = __importDefault(require("./media-resource"));
class Signature extends media_resource_1.default {
    get defaultContentType() {
        return 'image/png';
    }
    get resourceName() {
        return 'signature';
    }
    get resourcesName() {
        return 'signatures';
    }
    large(id) {
        return this.downloadVersion(id, 'large');
    }
    largeURL(id) {
        return this.client.url(this.memberAction(id, 'large', 'png'));
    }
    thumbnail(id) {
        return this.downloadVersion(id, 'thumbnail');
    }
    thumbnailURL(id) {
        return this.client.url(this.memberAction(id, 'thumbnail', 'png'));
    }
}
exports.default = Signature;
//# sourceMappingURL=signature.js.map