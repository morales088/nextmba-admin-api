import { Injectable } from '@nestjs/common';
import { AppliedStudiesRepository } from '../repositories/applied-studies.repository';
import { CreateStudyDto } from '../dto/create-study.dto';
import { UpdateStudyDto } from '../dto/update-study.dto';

@Injectable()
export class AppliedStudiesService {
    constructor(
      private readonly appliedStudiesRepository: AppliedStudiesRepository,
    ) {}

    async getAppliedStudies() {
      return await this.appliedStudiesRepository.find();
    }

    async getAppliedStudy(id:number) {
      return await this.appliedStudiesRepository.appliedStudy(id);
    }

    async getAppliedStudyPerCourse(id:number) {
      return await this.appliedStudiesRepository.perCourse(id);
    }

    async createStudy(data:CreateStudyDto) {
      return await this.appliedStudiesRepository.insert(data);
    }

    async updateStudy(id:number, data:UpdateStudyDto) {
      return await this.appliedStudiesRepository.update(id, data);
    }

}
