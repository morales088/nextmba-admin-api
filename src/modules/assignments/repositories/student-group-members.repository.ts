import { BadRequestException, Injectable, UseGuards } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Student_group_member } from '@prisma/client';
import { UpdateStudentGroupDto } from '../dto/update-student-group.dto';

@Injectable()
export class StudentGroupMembersRepository extends AbstractRepository<Student_group_member> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'Student_group_member'; // Specify the Prisma model name for entity
  }

  async find(): Promise<Student_group_member> {
    return this.prisma[this.modelName].findMany({
      // where: {status : 1},
      // include: { idividual_submissions: { where: { status: { in: [1, 2] } } } },
      orderBy: [
        {
          id: 'asc',
        },
      ],
    });
  }

  async byGroupId(groupId : number): Promise<Student_group_member[]> {
    return this.prisma[this.modelName].findMany({
      where: {group_id : groupId},
      // include: { idividual_submissions: { where: { status: { in: [1, 2] } } } },
      orderBy: [
        {
          id: 'asc',
        },
      ],
    });
  }

  async insert(data: Partial<Student_group_member>): Promise<Student_group_member> {
    return this.prisma[this.modelName].create({ data });
  }

  async deleteStudent(id: number): Promise<Student_group_member> {
    return this.prisma[this.modelName].delete({
      where: {
        id: id
      },
    })
  }

  // async updateGroup(id: number, data: UpdateStudentGroupDto): Promise<Student_groups> {
  //   const group = await this.findById(id);

  //   if (!group) {
  //     throw new BadRequestException('group does not exist.');
  //   }

  //   return this.prisma[this.modelName].update({
  //     where: { id: id },
  //     data: data,
  //   });
  // }
}
