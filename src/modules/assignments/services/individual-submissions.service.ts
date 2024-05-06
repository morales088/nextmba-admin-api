import { Injectable } from '@nestjs/common';
import { IndividualSubmmisionsRepository } from '../repositories/idividual-submissions.repository';
import { UpdateIndividualSubmissionDto } from '../dto/update-individual-submission.dto';

@Injectable()
export class IndividualSubmissionsService {
    constructor(
      private readonly individualSubmmisionsRepository: IndividualSubmmisionsRepository,
    ) {}

    async getSubmissions() {
      return await this.individualSubmmisionsRepository.find();
    }

    async getSubmission(id:number) {
      return await this.individualSubmmisionsRepository.submission(id);
    }

    // async createAssignment(data: CreateAssignmentDto) {
    //     return await this.assignmentsRepository.insert(data)
    // }

    async updateSubmission(id:number, data: UpdateIndividualSubmissionDto) {
        return await this.individualSubmmisionsRepository.updateSubmission(id, data)
    }
}
