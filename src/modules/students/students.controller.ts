import { Body, Controller, Get, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StudentsService } from './services/students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { UpdateStudentCourseDto } from './dto/update-studentCourse.dto';
import { CreateStudentCourseDto } from './dto/create-studentCourse.dto';

@Controller('students')
@UseGuards(AuthGuard('jwt'))
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get('/:StudentId')
  async getStudent(@Param('StudentId') StudentId: number) {
    return await this.studentsService.getStudent(StudentId);
  }

  @Get('/')
  async getStudents(
    @Request() req: any,
    @Query('search') search?: string,
    @Query('page_number') page_number?: number,
    @Query('per_page') per_page?: number
  ) {
    const admin = req.user;
    const pageNumber = page_number ? page_number : 1;
    const perPage = per_page ? per_page : 10;
    return await this.studentsService.getStudents(admin, search, pageNumber, perPage);
  }

  @Post('/')
  async createStudent(@Request() req: any, @Body() createStudentDto: CreateStudentDto) {
    const { id } = req.user;
    const studentData = {
      ...createStudentDto,
      created_by: id,
    };

    return await this.studentsService.createStudent(studentData);
  }

  @Put('/:studentId')
  async updateStudent(
    @Param('studentId') studentId: number,
    @Request() req: any,
    @Body() updateStudentDto: UpdateStudentDto
  ) {
    return await this.studentsService.updateStudent(studentId, updateStudentDto);
  }

  @Get('/payments/:StudentId')
  async getPayments(@Param('StudentId') StudentId: number) {
    return await this.studentsService.getPayments(StudentId);
  }

  @Get('/courses/:StudentId')
  async getCourses(@Param('StudentId') StudentId: number) {
    return await this.studentsService.getCourses(StudentId);
  }

  @Post('/student-course')
  async createStudentCourse(@Body() createStudentCourseDto: CreateStudentCourseDto) {
    const studentCourseData = {
      ...createStudentCourseDto,
    };

    return await this.studentsService.createStudentCourse(studentCourseData);
  }

  @Put('/student-course/:studCourseId')
  async updateStudentCourse(
    @Param('studCourseId') studCourseId: number,
    @Request() req: any,
    @Body() updateStudentCourseDto: UpdateStudentCourseDto
  ) {
    return await this.studentsService.updateStudentCourse(studCourseId, updateStudentCourseDto);
  }

  @Post('/email-credentials')
  async emailCredentials() {
    return await this.studentsService.emailStudents();
  }
}
