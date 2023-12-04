import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './sevices/files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { AwsS3Service } from 'src/common/aws/aws_s3.service';

@Controller('files')
@UseGuards(AuthGuard('jwt'))
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly awsS3Service: AwsS3Service
  ) {}

  @Get('/:fileId')
  async getFile(@Param('fileId') fileId: number) {
    return await this.filesService.getFile(fileId);
  }

  @Get('module/:moduleId')
  async getByModuleId(@Param('moduleId') moduleId: number) {
    return await this.filesService.getByModuleId(moduleId);
  }

  @Get('/')
  async getTopics() {
    return await this.filesService.getFiles();
  }

  @Post('/')
  @UseInterceptors(FileInterceptor('file'))
  async createFiles(
    @Body() createFileDto: CreateFileDto,
    @UploadedFile()
    file: Express.Multer.File
  ) {
    const fileData = {
      ...createFileDto,
    };

    if (file) {
      const path = 'files';
      const fileUrl = await this.awsS3Service.upload(path, file);
      fileData.file_link = fileUrl;
    }

    return await this.filesService.createFile(fileData);
  }

  @Put('/:fileId')
  @UseInterceptors(FileInterceptor('file'))
  async updateFile(
    @Param('fileId') fileId: number,
    @Request() req: any,
    @Body() updateFileDto: UpdateFileDto,
    @UploadedFile()
    file: Express.Multer.File
  ) {
    const fileData = {
      ...updateFileDto,
    };
    
    if (file) {
      const path = 'files';
      const fileUrl = await this.awsS3Service.upload(path, file);
      fileData.file_link = fileUrl;
    }
    return await this.filesService.updateFile(fileId, fileData);
  }
}
