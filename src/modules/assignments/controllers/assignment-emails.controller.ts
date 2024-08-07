import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AssignmentEmailsService } from '../services/assignment-emails.service';
import { CreateAssignmentEmailDto } from '../dto/create-assignmentEmail.dto';
import { UpdateAssignmentEmailDto } from '../dto/update-assignmentEmail.dto';

@Controller('assignment-emails')
@UseGuards(AuthGuard('jwt'))
export class AssignmentEmailsController {
    constructor(
      private readonly assignmentEmailsService: AssignmentEmailsService,
    ) {}
    @Get('/')
    async getAssignmentEmails(
      @Query('page_number') page_number?: number,
      @Query('per_page') per_page?: number) {
        const pageNumber = page_number ? page_number : 1;
        const perPage = per_page ? per_page : 10;
      return await this.assignmentEmailsService.getAll(pageNumber, perPage);
    }

    @Get('/:id')
    async getAssignmentEmail(@Param('id') id: number) {
      return await this.assignmentEmailsService.getById(id);
    }

    @Post('/')
    async createAssignmentEmails(
      @Body() createAssignmentEmailDto: CreateAssignmentEmailDto,
    ) {
      const assignmentData = {
        ...createAssignmentEmailDto,
      };
  
      return await this.assignmentEmailsService.createAssignment(assignmentData);
    }

    @Put('/:id')
    async updateAssignmentEmails(
      @Param('id') id: number,
      @Body() updateAssignmentEmailDto: UpdateAssignmentEmailDto,
    ) {
      const assignmentData = {
        ...updateAssignmentEmailDto,
      };
      
      return await this.assignmentEmailsService.updateAssignment(id, assignmentData);
    }
}
