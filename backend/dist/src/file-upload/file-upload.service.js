"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploadService = exports.FileType = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs = require("fs");
const path = require("path");
const uuid_1 = require("uuid");
var FileType;
(function (FileType) {
    FileType["IMAGE"] = "image";
    FileType["DOCUMENT"] = "document";
    FileType["VIDEO"] = "video";
})(FileType = exports.FileType || (exports.FileType = {}));
let FileUploadService = class FileUploadService {
    constructor(configService) {
        this.configService = configService;
        this.uploadDir = this.configService.get('UPLOAD_DIR') || 'uploads';
        this.maxFileSize = 10 * 1024 * 1024;
        this.allowedMimeTypes = {
            [FileType.IMAGE]: ['image/jpeg', 'image/png', 'image/gif'],
            [FileType.DOCUMENT]: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            [FileType.VIDEO]: ['video/mp4', 'video/quicktime'],
        };
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }
    validateFile(file, fileType) {
        if (file.size > this.maxFileSize) {
            throw new common_1.BadRequestException(`File size exceeds ${this.maxFileSize / 1024 / 1024}MB limit`);
        }
        if (!this.allowedMimeTypes[fileType].includes(file.mimetype)) {
            throw new common_1.BadRequestException(`Invalid file type. Allowed types: ${this.allowedMimeTypes[fileType].join(', ')}`);
        }
    }
    generateUniqueFilename(originalname) {
        const ext = path.extname(originalname);
        return `${(0, uuid_1.v4)()}${ext}`;
    }
    async uploadFile(file, fileType) {
        try {
            this.validateFile(file, fileType);
            const filename = this.generateUniqueFilename(file.originalname);
            const filepath = path.join(this.uploadDir, filename);
            await fs.promises.writeFile(filepath, file.buffer);
            const baseUrl = this.configService.get('BASE_URL') || 'http://localhost:3000';
            const url = `${baseUrl}/uploads/${filename}`;
            return {
                filename,
                originalname: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
                url,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to upload file: ${error.message}`);
        }
    }
    async deleteFile(filename) {
        try {
            const filepath = path.join(this.uploadDir, filename);
            await fs.promises.unlink(filepath);
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to delete file: ${error.message}`);
        }
    }
    async getFileUrl(filename) {
        const baseUrl = this.configService.get('BASE_URL') || 'http://localhost:3000';
        return `${baseUrl}/uploads/${filename}`;
    }
};
FileUploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], FileUploadService);
exports.FileUploadService = FileUploadService;
//# sourceMappingURL=file-upload.service.js.map