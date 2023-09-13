import { Injectable } from '@nestjs/common';
import { extractPublicIdFromUrl } from '../helper/image.helper';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';

@Injectable()
export class ImageService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async uploadImage(
    files: Express.Multer.File | Array<Express.Multer.File>,
    folderName?: string
  ): Promise<{ imageLinks?: string[]; imageLink?: string }> {
    const upload = async (file: Express.Multer.File) => {
      const { secure_url } = await this.cloudinaryService.uploadImage(
        file,
        folderName
      );
      return secure_url;
    };

    if (Array.isArray(files)) {
      const imageLinks = await Promise.all(files.map(upload));
      return { imageLinks };
    } else {
      const secure_url = await upload(files);
      return { imageLink: secure_url };
    }
  }

  async deleteImage(url: string) {
    const publicId = await extractPublicIdFromUrl(url);

    await this.cloudinaryService.deleteImage(publicId);

    return { message: 'Image removed successfully!' };
  }
}
