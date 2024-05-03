import { Injectable } from '@nestjs/common';
import { AssignmentsRepository } from '../repositories/assignments.repository';
import { CreateAssignmentDto } from '../dto/create-assignment.dto';
import { UpdateAssignmentDto } from '../dto/update-assignment.dto';

@Injectable()
export class AssignmentsService {
    constructor(
      private readonly assignmentsRepository: AssignmentsRepository,
    ) {}

    async getAssignments() {
      return await this.assignmentsRepository.find();
    }

    async getAssignment(id:number) {
      return await this.assignmentsRepository.assignment(id);
    }

    async createAssignment(data: CreateAssignmentDto) {
        return await this.assignmentsRepository.insert(data)
    }

    async updateAssignment(id:number, data: UpdateAssignmentDto) {
        return await this.assignmentsRepository.updateAssignment(id, data)
    }
}
