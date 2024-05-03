import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AssignmentsService } from './services/assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('assignments')
@UseGuards(AuthGuard('jwt'))
export class AssignmentsController {
    constructor(
      private readonly assignmentsService: AssignmentsService,
    ) {}

    @Get('/')
    async getAppliedStudies() {
      return await this.assignmentsService.getAssignments();
    }

    @Get('/:assignmentId')
    async getAppliedStudy(@Param('assignmentId') assignmentId: number) {
      return await this.assignmentsService.getAssignment(assignmentId);
    }

    @Post('/')
    async createBilling(
      @Body() createAssignmentDto: CreateAssignmentDto,
    ) {
      const assignmentData = {
        ...createAssignmentDto,
      };
  
      return await this.assignmentsService.createAssignment(assignmentData);
    }

    @Put('/:assignmentId')
    async updateBilling(
      @Param('assignmentId') assignmentId: number,
      @Body() updateAssignmentDto: UpdateAssignmentDto,
    ) {
      const assignmentData = {
        ...updateAssignmentDto,
      };
      
      return await this.assignmentsService.updateAssignment(assignmentId, assignmentData);
    }
}
