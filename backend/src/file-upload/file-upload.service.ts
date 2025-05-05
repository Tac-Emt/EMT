import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export enum FileType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  VIDEO = 'video',
}

export interface FileUploadResult {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  url: string;
}

@Injectable()
export class FileUploadService {
  private readonly uploadDir: string;
  private readonly maxFileSize: number;
  private readonly allowedMimeTypes: Record<FileType, string[]>;

  constructor(private configService: ConfigService) {
    this.uploadDir = this.configService.get('UPLOAD_DIR') || 'uploads';
    this.maxFileSize = 10 * 1024 * 1024; // 10MB

    this.allowedMimeTypes = {
      [FileType.IMAGE]: ['image/jpeg', 'image/png', 'image/gif'],
      [FileType.DOCUMENT]: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      [FileType.VIDEO]: ['video/mp4', 'video/quicktime'],
    };

    // Create upload directory if it doesn't exist
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  private validateFile(file: Express.Multer.File, fileType: FileType): void {
    // Check file size
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(`File size exceeds ${this.maxFileSize / 1024 / 1024}MB limit`);
    }

    // Check file type
    if (!this.allowedMimeTypes[fileType].includes(file.mimetype)) {
      throw new BadRequestException(`Invalid file type. Allowed types: ${this.allowedMimeTypes[fileType].join(', ')}`);
    }
  }

  private generateUniqueFilename(originalname: string): string {
    const ext = path.extname(originalname);
    return `${uuidv4()}${ext}`;
  }

  async uploadFile(file: Express.Multer.File, fileType: FileType): Promise<FileUploadResult> {
    try {
      this.validateFile(file, fileType);

      const filename = this.generateUniqueFilename(file.originalname);
      const filepath = path.join(this.uploadDir, filename);

      // Write file to disk
      await fs.promises.writeFile(filepath, file.buffer);

      // Generate URL
      const baseUrl = this.configService.get('BASE_URL') || 'http://localhost:3000';
      const url = `${baseUrl}/uploads/${filename}`;

      return {
        filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to upload file: ${error.message}`);
    }
  }

  async deleteFile(filename: string): Promise<void> {
    try {
      const filepath = path.join(this.uploadDir, filename);
      await fs.promises.unlink(filepath);
    } catch (error) {
      throw new BadRequestException(`Failed to delete file: ${error.message}`);
    }
  }

  async getFileUrl(filename: string): Promise<string> {
    const baseUrl = this.configService.get('BASE_URL') || 'http://localhost:3000';
    return `${baseUrl}/uploads/${filename}`;
  }
} 