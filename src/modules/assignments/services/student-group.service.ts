import { Injectable } from '@nestjs/common';
import { StudentGroupRepository } from '../repositories/student-groups.repository';
import { CreateStudentGroupDto } from '../dto/create-student-group.dto';
import { UpdateStudentGroupDto } from '../dto/update-student-group.dto';

@Injectable()
export class StudentGroupService {
    constructor(
      private readonly studentGroupRepository: StudentGroupRepository,
    ) {}

    async getGroups() {
      return await this.studentGroupRepository.find();
    }

    async getGroup(id:number) {
      return await this.studentGroupRepository.group(id);
    }

    async createGroup(data: CreateStudentGroupDto) {
        return await this.studentGroupRepository.insert(data)
    }

    async updateGroup(id:number, data: UpdateStudentGroupDto) {
        return await this.studentGroupRepository.updateGroup(id, data)
    }
}
