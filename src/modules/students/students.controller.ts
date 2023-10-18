import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StudentsService } from './services/students.service';
import { CreateStudentDto } from './dto/create-student.dto';

@Controller('students')
@UseGuards(AuthGuard('jwt'))
export class StudentsController {
    constructor(private readonly studentsService: StudentsService) {}
  
    @Get('/:StudentId')
    async getModule(@Param('StudentId') StudentId: number) {
      return await this.studentsService.getStudent(StudentId);
    }
  
    @Get('/')
    async getModules() {
      return await this.studentsService.getStudents();
    }
  
    @Post('/')
    async createModule(@Body() createStudentDto: CreateStudentDto) {
      const studentData = {
        ...createStudentDto,
      };
  
      return await this.studentsService.createStudent(studentData);
    }
  
    // @Put('/:moduleId')
    // async updateModule(
    //   @Param('moduleId') moduleId: number,
    //   @Request() req: any,
    //   @Body() updateModuleDto: UpdateModuleDto
    // ) {
    //   return await this.modulesService.updateModule(moduleId, updateModuleDto);
    // }
}
