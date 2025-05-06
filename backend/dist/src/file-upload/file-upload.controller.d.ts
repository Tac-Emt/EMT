/// <reference types="multer" />
import { FileUploadService } from './file-upload.service';
export declare class FileUploadController {
    private readonly fileUploadService;
    constructor(fileUploadService: FileUploadService);
    uploadImage(file: Express.Multer.File): Promise<import("./file-upload.service").FileUploadResult>;
    uploadDocument(file: Express.Multer.File): Promise<import("./file-upload.service").FileUploadResult>;
    uploadVideo(file: Express.Multer.File): Promise<import("./file-upload.service").FileUploadResult>;
    deleteFile(filename: string): Promise<{
        message: string;
    }>;
}
