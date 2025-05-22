import {
    Injectable,
    BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import * as mime from 'mime-types';
import { v4 as uuidv4 } from 'uuid';
import { MAX_FILE_SIZE } from 'src/constants';
import { buildResponse } from '@kemuko-org/shared-utils';

@Injectable()
export class UploadService {
    private readonly maxFileSize = MAX_FILE_SIZE;
    private readonly bucketName: string;
    private readonly client: S3Client;

    constructor(private readonly configService: ConfigService) {
        const region = this.configService.get<string>('S3_REGION');
        const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY');
        const secretAccessKey = this.configService.get<string>('S3_SECRET_ACCESS_KEY');
        this.bucketName = this.configService.get<string>('S3_BUCKET_NAME');

        this.client = new S3Client({
            region,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });
    }

    async uploadImage(file: Express.Multer.File) {
        this.validateFile(file, ['image/jpeg', 'image/png', 'image/gif'], 5 * 1024 * 1024);
        return this.uploadToS3(file);
    }

    async uploadVideo(file: Express.Multer.File) {
        this.validateFile(file, ['video/mp4', 'video/webm', 'video/ogg'], this.maxFileSize);
        return this.uploadToS3(file);
    }

    async uploadDocument(file: Express.Multer.File) {
        this.validateFile(
            file,
            [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain',
            ],
            20 * 1024 * 1024
        );
        return this.uploadToS3(file);
    }

    async uploadThumbnail(file: Express.Multer.File) {
        this.validateFile(file, ['image/jpeg', 'image/png'], 2 * 1024 * 1024);
        return this.uploadToS3(file);
    }

    private async uploadToS3(file: Express.Multer.File) {
        const key = `${uuidv4()}-${this.sanitizeFileName(file.originalname)}`;

        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            Metadata: {
                originalName: file.originalname,
            },
        });

        await this.client.send(command);

        const url = `https://${this.bucketName}.s3.amazonaws.com/${key}`;

        return buildResponse({ url, key }, 'File uploaded successfully');
    }

    private validateFile(file: Express.Multer.File, allowedMimeTypes: string[], maxSize: number): void {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        if (file.size > maxSize) {
            throw new BadRequestException(`File size exceeds limit of ${maxSize / (1024 * 1024)}MB`);
        }

        const mimeType = mime.lookup(file.originalname) || file.mimetype;

        if (!allowedMimeTypes.includes(mimeType)) {
            throw new BadRequestException(`Invalid file type. Allowed: ${allowedMimeTypes.join(', ')}`);
        }
    }

    private sanitizeFileName(originalName: string): string {
        const ext = originalName.includes('.') ? `.${originalName.split('.').pop()}` : '';
        const name = originalName.replace(/\.[^/.]+$/, '');
        return name.toLowerCase().replace(/[^a-z0-9]/gi, '-') + ext;
    }

    async deleteFile(key: string) {
        const command = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });
        await this.client.send(command);
        return buildResponse(null, 'File deleted successfully');
    }
}
