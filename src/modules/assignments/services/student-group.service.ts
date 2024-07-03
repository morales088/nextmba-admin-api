import { Injectable } from '@nestjs/common';
import { StudentGroupsRepository } from '../repositories/student-groups.repository';
import { CreateStudentGroupDto } from '../dto/create-student-group.dto';
import { UpdateStudentGroupDto } from '../dto/update-student-group.dto';
import { StudentGroupMembersRepository } from '../repositories/student-group-members.repository';
import { CreateMemberDto } from '../dto/create-member.dto';
import { StudentCoursesRepository } from 'src/modules/students/repositories/student_courses.repository';
import { group } from 'console';
import { StudentRepository } from 'src/modules/students/repositories/student.repository';

@Injectable()
export class StudentGroupService {
  constructor(
    private readonly studentGroupsRepository: StudentGroupsRepository,
    private readonly studentGroupMembersRepository: StudentGroupMembersRepository,
    private readonly studentCoursesRepository: StudentCoursesRepository,
    private readonly studentRepository: StudentRepository
  ) {}

  async getGroups() {
    const results = await this.studentGroupsRepository.find();
    const groups = results as any;

    for (let group of groups) {
      const members = (await this.getMembers(group)).length;
      group.member = members;
    }

    return groups;
  }

  async getGroup(id: number) {
    const result = await this.studentGroupsRepository.group(id);
    const members = (await this.getMembers(result)).length;

    const group = result as any;
    group.members = members;
    return result;
  }

  async getGroupMember(id: number, pageNumber: number = 1, perPage: number = 10) {
    const group = await this.getGroup(id);
    const members = await this.getMembers(group);
    members.slice(pageNumber, pageNumber + perPage)
    
    return members
  }

  async createGroup(data: CreateStudentGroupDto) {
    return await this.studentGroupsRepository.insert(data);
  }

  async updateGroup(id: number, data: UpdateStudentGroupDto) {
    return await this.studentGroupsRepository.updateGroup(id, data);
  }

  async addMember(data) {
    const student = await this.studentRepository.findByEmail(data.email);
    const memberData = {
      group_id: data.group_id,
      student_id: student.id,
    };

    return await this.studentGroupMembersRepository.insert(memberData);
  }

  async deleteMember(memberId: number) {
    return await this.studentGroupMembersRepository.deleteStudent(memberId);
  }

  async getMembers(group): Promise<{}[]> {
    if (group.course_id) {
      return await this.studentCoursesRepository.findByCourse(group.course_id);
    } else {
      return await this.studentGroupMembersRepository.byGroupId(group.id);
    }
  }
}
