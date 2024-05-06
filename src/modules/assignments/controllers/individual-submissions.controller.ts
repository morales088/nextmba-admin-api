import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IndividualSubmissionsService } from '../services/individual-submissions.service';

@Controller('individual-submissions')
@UseGuards(AuthGuard('jwt'))
export class IndividualSubmissionsController {
    constructor(
      private readonly individualSubmissionsService: IndividualSubmissionsService,
    ) {}

    @Get('/')
    async getSubmissions() {
      return await this.individualSubmissionsService.getSubmissions();
    }

    @Get('/:submissionId')
    async getSubmission(@Param('submissionId') submissionId: number) {
      return await this.individualSubmissionsService.getSubmission(submissionId);
    }

    // @Post('/')
    // async createBilling(
    //   @Body() createAssignmentDto: CreateAssignmentDto,
    // ) {
    //   const assignmentData = {
    //     ...createAssignmentDto,
    //   };
  
    //   return await this.assignmentsService.createAssignment(assignmentData);
    // }

    // @Put('/:assignmentId')
    // async updateBilling(
    //   @Param('assignmentId') assignmentId: number,
    //   @Body() updateAssignmentDto: UpdateAssignmentDto,
    // ) {
    //   const assignmentData = {
    //     ...updateAssignmentDto,
    //   };
      
    //   return await this.assignmentsService.updateAssignment(assignmentId, assignmentData);
    // }
}
