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
import { AuthGuard } from '@nestjs/passport';
import { AppliedStudiesService } from './services/applied_studies.service';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { CreateStudyDto } from './dto/create-study.dto';
import { AwsS3Service } from 'src/common/aws/aws_s3.service';
import { UpdateStudyDto } from './dto/update-study.dto';

@Controller('applied-studies')
@UseGuards(AuthGuard('jwt'))
export class AppliedStudiesController {
  constructor(
    private readonly appliedStudiesService: AppliedStudiesService,
    private readonly awsS3Service: AwsS3Service
  ) {}

  @Get('/')
  async getAppliedStudies() {
    return await this.appliedStudiesService.getAppliedStudies();
  }

  @Get('/:appliedId')
  async getAppliedStudy(@Param('appliedId') appliedId: number) {
    return await this.appliedStudiesService.getAppliedStudy(appliedId);
  }

  @Post('/')
  @UseInterceptors(FileInterceptor('cover_photo'))
  async createAppliedStudy(
    @Body() createStudyDto: CreateStudyDto,
    @UploadedFile()
    cover_photo: Express.Multer.File
  ) {
    const studyData = {
      ...createStudyDto,
    };

    if (cover_photo) {
      const path = 'applied_studies';
      const fileUrl = await this.awsS3Service.upload(path, cover_photo);
      studyData.cover_photo = fileUrl;
    }

    return await this.appliedStudiesService.createStudy(studyData);
  }

  @Put('/:studyId')
  @UseInterceptors(FileInterceptor('cover_image'))
  async updateStudy(
    @Param('studyId') studyId: number,
    @Request() req: any,
    @Body() updateStudyDto: UpdateStudyDto,
    @UploadedFile()
    cover_image: Express.Multer.File
  ) {
    const studyData = {
      ...updateStudyDto,
    };
    
    if (cover_image) {
      const path = 'files';
      const fileUrl = await this.awsS3Service.upload(path, cover_image);
      studyData.cover_photo = fileUrl;
    }

    return await this.appliedStudiesService.updateStudy(studyId, studyData);
  }
}
