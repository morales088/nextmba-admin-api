import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ImageService } from './services/image.service';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('/upload')
  @UseInterceptors(FilesInterceptor('images'))
  async upload(@UploadedFiles() files: Array<Express.Multer.File> = null) {

    const folderName = 'images';

    if (!files || files.length == 0) {
      throw new BadRequestException('No files were uploaded.');
    }

    return this.imageService.uploadImage(files, folderName);
  }

  @Delete('/delete')
  async delete(@Body('imageUrl') imageUrl: string) {
    return this.imageService.deleteImage(imageUrl);
  }
}
