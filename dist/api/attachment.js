"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const media_resource_1 = __importDefault(require("./media-resource"));
class Attachment extends media_resource_1.default {
    get defaultContentType() {
        return '';
    }
    get resourceName() {
        return 'attachment';
    }
    get resourcesName() {
        return 'attachments';
    }
}
exports.default = Attachment;
//# sourceMappingURL=attachment.js.map