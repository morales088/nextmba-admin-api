import { BadRequestException, Injectable, UseGuards } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Student_groups } from '@prisma/client';
import { UpdateStudentGroupDto } from '../dto/update-student-group.dto';

@Injectable()
export class StudentGroupsRepository extends AbstractRepository<Student_groups> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'Student_groups'; // Specify the Prisma model name for entity
  }

  async find(): Promise<Student_groups[]> {
    return this.prisma[this.modelName].findMany({
      where: {status : 1},
      // include: { idividual_submissions: { where: { status: { in: [1, 2] } } } },
      orderBy: [
        {
          id: 'asc',
        },
      ],
    });
  }

  async group(id: number): Promise<Student_groups> {
    return this.prisma[this.modelName].findFirst({
      where: { id, status: 1 },
      orderBy: [
        {
          id: 'asc',
        },
      ],
    });
  }

  async insert(data: Partial<Student_groups>): Promise<Student_groups> {
    return this.prisma[this.modelName].create({ data });
  }

  async updateGroup(id: number, data: UpdateStudentGroupDto): Promise<Student_groups> {
    const group = await this.findById(id);

    if (!group) {
      throw new BadRequestException('group does not exist.');
    }

    return this.prisma[this.modelName].update({
      where: { id: id },
      data: data,
    });
  }
}
