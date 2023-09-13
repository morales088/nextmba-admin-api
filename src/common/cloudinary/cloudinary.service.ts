import { BadRequestException, Injectable } from '@nestjs/common';
import { v2 } from 'cloudinary';
import toStream = require('buffer-to-stream');

@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: Express.Multer.File,
    folderName: string = ''
  ): Promise<{ secure_url: string; public_id: string }> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream(
        {
          folder: `${process.env.CLOUD_PROJECT_FOLDER_NAME}/${folderName}`, // set the folder path in Cloudinary
        },
        (error, result) => {
          if (error) return reject(new BadRequestException(error.message));
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        }
      );

      toStream(file.buffer).pipe(upload);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      v2.uploader.destroy(publicId, (error, result) => {
        if (error) return reject(new BadRequestException(error.message));
        resolve();
      });
    });
  }
}
