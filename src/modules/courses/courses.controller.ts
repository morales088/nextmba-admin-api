import { Body, Controller, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateCourseDto } from './dto/create-course.dto';
import { CoursesService } from './services/courses.service';
import { UpdateCourseDto } from './dto/update-course.dto';

@Controller('courses')
@UseGuards(AuthGuard('jwt'))
export class CoursesController {
  constructor(
    private readonly courseService: CoursesService,
    
  ) {}

  @Get('/')
  async getCourses() {
    return await this.courseService.getCourses();
  }

  @Post('/')
  async createCourse(@Body() createCourseDto: CreateCourseDto) {

    const courseData = {
      ...createCourseDto,
    };

    return await this.courseService.createCourse(courseData);

  }

  @Put('/:courseId')
  async UpdateCourse(
    @Param('courseId') courseId: string,
    @Request() req: any, 
    @Body() updateCourseDto: UpdateCourseDto) {

    // const { email } = req.user;
    const details = req.user;
    return await this.courseService.updateCourse(courseId,updateCourseDto);

  }
}
