import { Body, Controller, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StudentsService } from './services/students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Controller('students')
@UseGuards(AuthGuard('jwt'))
export class StudentsController {
    constructor(private readonly studentsService: StudentsService) {}
  
    @Get('/:StudentId')
    async getStudent(@Param('StudentId') StudentId: number) {
      return await this.studentsService.getStudent(StudentId);
    }
  
    @Get('/')
    async getStudents() {
      return await this.studentsService.getStudents();
    }
  
    @Post('/')
    async createStudent(@Body() createStudentDto: CreateStudentDto) {
      const studentData = {
        ...createStudentDto,
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
}
