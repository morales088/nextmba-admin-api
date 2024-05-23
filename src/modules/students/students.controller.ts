import { Body, Controller, Get, Param, Post, Put, Query, Request, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StudentsService } from './services/students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { UpdateStudentCourseDto } from './dto/update-studentCourse.dto';
import { CreateStudentCourseDto } from './dto/create-studentCourse.dto';
import { Response } from 'express';
import * as excel from 'exceljs';

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
    @Query('per_page') per_page?: number,
    @Query('enrolled_to') enrolled_to?: number,
    @Query('not_enrolled_to') not_enrolled_to?: number,
    @Query('country') country?: string,
    @Query('company') company?: string,
    @Query('phone') phone?: string,
    @Query('position') position?: string,
    @Query('account_type') account_type?: number,
    @Query('course_tier') course_tier?: number
  ) {
    const admin = req.user;
    const pageNumber = page_number ? page_number : 1;
    const perPage = per_page ? per_page : 10;
    const filters = {
      enrolled_to,
      not_enrolled_to,
      country,
      company,
      phone,
      position,
      account_type,
      course_tier
    };

    return await this.studentsService.getStudents(admin, search, filters, pageNumber, perPage);
  }

  @Post('/')
  async createStudent(@Request() req: any, @Body() createStudentDto: CreateStudentDto) {
    const { id } = req.user;
    const studentData = {
      ...createStudentDto,
      created_by: id,
      library_access: 1,
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

  @Get('/download/csv')
  async downloadStudents(
    @Res() res: Response,
    @Request() req: any,
    @Query('search') search?: string,
    @Query('enrolled_to') enrolled_to?: string,
    @Query('not_enrolled_to') not_enrolled_to?: string,
    @Query('country') country?: string,
    @Query('company') company?: string,
    @Query('phone') phone?: string,
    @Query('position') position?: string,
    @Query('account_type') account_type?: number
  ) {
    const admin = req.user;
    const filters = {
      enrolled_to,
      not_enrolled_to,
      country,
      company,
      phone,
      position,
      account_type,
    };

    const students = await this.studentsService.getStudents(admin, search, filters, 1, 1000000000000000000);

    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // Add data to the worksheet
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Name', key: 'name', width: 10 },
      { header: 'Email', key: 'email', width: 10 },
      { header: 'Phone', key: 'phone', width: 10 },
      { header: 'Country', key: 'country', width: 10 },
      { header: 'Company', key: 'company', width: 10 },
      { header: 'Position', key: 'position', width: 10 },
      { header: 'Language', key: 'language', width: 10 },
      { header: 'Afiliate Access', key: 'affiliate_access', width: 10 },
      { header: 'Last Login', key: 'last_login', width: 10 },
      { header: 'Date Created', key: 'date_created', width: 10 },
      { header: 'Created By', key: 'created_by', width: 10 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Courses', key: 'courses', width: 10 },
    ];

    const results = students as [any];

    results.forEach((student) => {
      const status = student.status == 1 ? 'active' : 'deleted';
      const affiliate_access = student.affiliate_access == 1 ? true : false;

      const courses = student.student_courses.map((obj) => obj.course.name).join(', ');

      worksheet.addRow({
        id: student.id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        country: student.country,
        company: student.company,
        position: student.position,
        affiliate_access: affiliate_access,
        last_login: student.last_login ? student.last_login.toLocaleString() : '',
        date_created: student.createdAt.toLocaleString(),
        status: status,
        courses: courses,
      });
    });

    // Set up the response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=student.csv');

    // Stream the workbook to the response
    workbook.csv.write(res);

    // End the response
    res.end();
  }
}
