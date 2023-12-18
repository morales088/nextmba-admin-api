import { Injectable } from '@nestjs/common';
import { S3 } from 'multer-s3';
import { extname } from 'path';
import { AwsService } from './aws.service';

@Injectable()
export class AwsS3Service {
  constructor(private readonly awsService: AwsService) {}

  async uploadSmallFile(path: string, file: Express.Multer.File): Promise<string> {
    const s3 = this.awsService.getS3Instance();
    const params: S3.Params = {
      Bucket: process.env.AWS_BUCKET,
      Key: `${path}/${Date.now().toString()}${extname(file.originalname)}`,
      Body: file.buffer,
    };

    const response = await s3.upload(params).promise();
    return response.Location;
  }

  async uploadBigfile(path: string, file: Express.Multer.File) {
    const fileName = `${path}/${Date.now().toString()}-${file.originalname}`;
    const uploadId = await this.initiateMultipartUpload(fileName);
    const parts: AWS.S3.CompletedPart[] = [];

    try {
      // Split the file into smaller chunks
      const chunkSize = 5 * 1024 * 1024; // 5 MB chunk size (adjust as needed)
      const fileBuffer = file.buffer;
      // const parts = [];
      for (let offset = 0; offset < fileBuffer.length; offset += chunkSize) {
        const chunk = fileBuffer.slice(offset, offset + chunkSize);
        const partNumber = Math.floor(offset / chunkSize) + 1;
        const part = await this.uploadPart(uploadId, partNumber, chunk, fileName);
        parts.push(part);
      }

      // After uploading all parts, complete the multi-part upload
      const fileUrl = await this.completeMultipartUpload(uploadId, fileName, parts);
      return fileUrl;
    } catch (error) {
      // Handle the error
      throw new Error('Failed to upload the file in parts');
    }
  }

  async initiateMultipartUpload(fileName: string) {
    const s3 = this.awsService.getS3Instance();
    const params: AWS.S3.CreateMultipartUploadRequest = {
      Bucket: process.env.AWS_BUCKET,
      Key: fileName,
    };

    const response = await s3.createMultipartUpload(params).promise();
    return response.UploadId;
  }

  async uploadPart(uploadId: string, partNumber: number, partData: Buffer, fileName: string) {
    const s3 = this.awsService.getS3Instance();
    const params: AWS.S3.UploadPartRequest = {
      Bucket: process.env.AWS_BUCKET,
      Key: fileName,
      UploadId: uploadId,
      PartNumber: partNumber,
      Body: partData,
    };

    const response = await s3.uploadPart(params).promise();
    return { ETag: response.ETag, PartNumber: partNumber };
  }

  async completeMultipartUpload(uploadId: string, fileName: string, parts: AWS.S3.CompletedPart[]) {
    const s3 = this.awsService.getS3Instance();
    const params: AWS.S3.CompleteMultipartUploadRequest = {
      Bucket: process.env.AWS_BUCKET,
      Key: fileName,
      UploadId: uploadId,
      MultipartUpload: { Parts: parts },
    };

    const response = await s3.completeMultipartUpload(params).promise();
    return response.Location;
  }

  async upload(path: string, file: Express.Multer.File): Promise<string> {
    let fileUrl;
    if (
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/gif' ||
      file.mimetype === 'image/webp' ||
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ) {
      if (file.size > 100000000) {
        // more than 100mb
        fileUrl = await this.uploadBigfile(path, file);
      } else {
        fileUrl = await this.uploadSmallFile(path, file);
      }
    } else {
      throw new Error('Upload jpeg/jpg/png/gif/webp/pdf file.');
    }
    return fileUrl;
  }
}
