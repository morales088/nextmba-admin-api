import { Injectable } from '@nestjs/common';
import { AssignmentEmailsRepository } from '../repositories/assignment-emails.repository';
import { CreateAssignmentEmailDto } from '../dto/create-assignmentEmail.dto';
import { UpdateAssignmentEmailDto } from '../dto/update-assignmentEmail.dto';

@Injectable()
export class AssignmentEmailsService {
  constructor(private readonly assignmentEmailsRepository: AssignmentEmailsRepository) {}

  async getAll(pageNumber: number, perPage: number) {
    return await this.assignmentEmailsRepository.find(pageNumber, perPage);
  }

  async getById(id: number) {
    return await this.assignmentEmailsRepository.findById(id);
  }

  async createAssignment(data: CreateAssignmentEmailDto) {
    return await this.assignmentEmailsRepository.insert(data);
  }

  async updateAssignment(id: number, data: UpdateAssignmentEmailDto) {
    return await this.assignmentEmailsRepository.updateAssignment(id, data);
  }
}
