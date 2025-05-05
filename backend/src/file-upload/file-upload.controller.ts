import { Controller, Post, Delete, Param, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService, FileType } from './file-upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@Controller('file-upload')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('image')
  @Roles(Role.ADMIN, Role.ORGANIZER)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.fileUploadService.uploadFile(file, FileType.IMAGE);
  }

  @Post('document')
  @Roles(Role.ADMIN, Role.ORGANIZER, Role.SPEAKER)
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
    return this.fileUploadService.uploadFile(file, FileType.DOCUMENT);
  }

  @Post('video')
  @Roles(Role.ADMIN, Role.ORGANIZER)
  @UseInterceptors(FileInterceptor('file'))
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    return this.fileUploadService.uploadFile(file, FileType.VIDEO);
  }

  @Delete(':filename')
  @Roles(Role.ADMIN, Role.ORGANIZER)
  async deleteFile(@Param('filename') filename: string) {
    await this.fileUploadService.deleteFile(filename);
    return { message: 'File deleted successfully' };
  }
} 