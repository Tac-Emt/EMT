/// <reference types="multer" />
import { ConfigService } from '@nestjs/config';
export declare enum FileType {
    IMAGE = "image",
    DOCUMENT = "document",
    VIDEO = "video"
}
export interface FileUploadResult {
    filename: string;
    originalname: string;
    mimetype: string;
    size: number;
    url: string;
}
export declare class FileUploadService {
    private configService;
    private readonly uploadDir;
    private readonly maxFileSize;
    private readonly allowedMimeTypes;
    constructor(configService: ConfigService);
    private validateFile;
    private generateUniqueFilename;
    uploadFile(file: Express.Multer.File, fileType: FileType): Promise<FileUploadResult>;
    deleteFile(filename: string): Promise<void>;
    getFileUrl(filename: string): Promise<string>;
}
