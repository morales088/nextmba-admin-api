import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  Param,
  ParseFilePipe,
  Post,
  Put,
  Request,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateCourseDto } from './dto/create-course.dto';
import { CoursesService } from './services/courses.service';
import { UpdateCourseDto } from './dto/update-course.dto';
import { AnyFilesInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AwsS3Service } from 'src/common/aws/aws_s3.service';

@Controller('courses')
@UseGuards(AuthGuard('jwt'))
export class CoursesController {
  constructor(
    private readonly courseService: CoursesService,
    private readonly awsS3Service: AwsS3Service
  ) {}

  @Get('/:courseId')
  async getCourse(@Param('courseId') courseId: number) {
    return await this.courseService.getCourse(courseId);
  }

  @Get('/')
  async getCourses() {
    return await this.courseService.getCourses();
  }

  @Post('/')
  @UseInterceptors(AnyFilesInterceptor())
  async createCourse(@Body() createCourseDto: CreateCourseDto, @UploadedFiles() files: Array<Express.Multer.File>) {
    const courseData = {
      ...createCourseDto,
    };
    const images = files as unknown as { fieldname: string }[];
    for (const image of images) {
      if (image.fieldname === 'file_cover') {
        const path = 'images/courses_cover';
        const picture = image as unknown as Express.Multer.File
        const fileUrl = await this.awsS3Service.upload(path, picture);
        courseData.cover_photo = fileUrl;
      }
      if (image.fieldname === 'applied_cover') {
        const path = 'images/applied_cover';
        const picture = image as unknown as Express.Multer.File
        const fileUrl = await this.awsS3Service.upload(path, picture);
        courseData.applied_cover_photo = fileUrl;
      }
    }

    return await this.courseService.createCourse(courseData);
  }

  @Put('/:courseId')
  @UseInterceptors(AnyFilesInterceptor())
  async UpdateCourse(
    @Param('courseId') courseId: number,
    @Request() req: any,
    @Body() updateCourseDto: UpdateCourseDto,
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {
    const details = req.user;

    const courseData = {
      ...updateCourseDto,
    };
    
    const images = files as unknown as { fieldname: string }[];
    for (const image of images) {
      if (image.fieldname === 'file_cover') {
        const path = 'images/courses_cover';
        const picture = image as unknown as Express.Multer.File
        const fileUrl = await this.awsS3Service.upload(path, picture);
        courseData.cover_photo = fileUrl;
      }
      if (image.fieldname === 'applied_cover') {
        const path = 'images/applied_cover';
        const picture = image as unknown as Express.Multer.File
        const fileUrl = await this.awsS3Service.upload(path, picture);
        courseData.applied_cover_photo = fileUrl;
      }
    }

    return await this.courseService.updateCourse(courseId, courseData);
  }
}
