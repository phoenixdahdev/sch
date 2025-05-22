/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { UploadService } from '../services/upload.service';
import { AuthGuard } from '../guards/auth.guard';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Upload image' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file, @Request() req) {
    return this.uploadService.uploadImage(file, req.user.id);
  }

  @Post('video')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Upload video' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadVideo(@UploadedFile() file, @Request() req) {
    return this.uploadService.uploadVideo(file, req.user.id);
  }

  @Post('document')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Upload document' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(@UploadedFile() file, @Request() req) {
    return this.uploadService.uploadDocument(file, req.user.id);
  }

  @Post('thumbnail')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Upload course thumbnail' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadThumbnail(@UploadedFile() file, @Request() req) {
    return this.uploadService.uploadThumbnail(file, req.user.id);
  }
}
