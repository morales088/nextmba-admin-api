import { Body, Controller, Get, Param, Post, Put, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IndividualSubmissionsService } from '../services/individual-submissions.service';
import { UpdateIndividualSubmissionDto } from '../dto/update-individual-submission.dto';

@Controller('individual-submissions')
@UseGuards(AuthGuard('jwt'))
export class IndividualSubmissionsController {
    constructor(
      private readonly individualSubmissionsService: IndividualSubmissionsService,
    ) {}

    @Get('/')
    async getSubmissions(
      @Query('search') search?: string,
      @Query('assignment_id') assignmentId?: number,
      @Query('status') status?: number,
      ) {
      return await this.individualSubmissionsService.getSubmissions(search,assignmentId, status);
    }

    @Get('/:submissionId')
    async getSubmission(@Param('submissionId') submissionId: number) {
      return await this.individualSubmissionsService.getSubmission(submissionId);
    }

    @Put('/:submissionId')
    async updateSubmission(
      @Param('submissionId') submissionId: number,
      @Body() updateIndividualSubmissionDto: UpdateIndividualSubmissionDto,
    ) {
      const submissionData = {
        ...updateIndividualSubmissionDto,
      };
      
      return await this.individualSubmissionsService.updateSubmission(submissionId, submissionData);
    }
}
