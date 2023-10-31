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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateCourseDto } from './dto/create-course.dto';
import { CoursesService } from './services/courses.service';
import { UpdateCourseDto } from './dto/update-course.dto';
import { FileInterceptor } from '@nestjs/platform-express';
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
  @UseInterceptors(FileInterceptor('file_cover'))
  async createCourse(
    @Body() createCourseDto: CreateCourseDto,
    @UploadedFile()
    file_cover: Express.Multer.File
  ) {
    const courseData = {
      ...createCourseDto,
    };
    if (file_cover) {
      const path = 'images/courses_cover';
      const fileUrl = await this.awsS3Service.upload(path, file_cover);
      courseData.cover_photo = fileUrl;
    }

    return await this.courseService.createCourse(courseData);
  }

  @Put('/:courseId')
  @UseInterceptors(FileInterceptor('file_cover'))
  async UpdateCourse(
    @Param('courseId') courseId: number,
    @Request() req: any,
    @Body() updateCourseDto: UpdateCourseDto,
    @UploadedFile()
    file_cover: Express.Multer.File
  ) {
    const details = req.user;

    const courseData = {
      ...updateCourseDto,
    };

    if (file_cover) {
      const path = 'images/courses_cover';
      const fileUrl = await this.awsS3Service.upload(path, file_cover);
      courseData.cover_photo = fileUrl;
    }
    
    return await this.courseService.updateCourse(courseId, courseData);
  }
}
