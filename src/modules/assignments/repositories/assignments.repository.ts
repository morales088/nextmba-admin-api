import { BadRequestException, Injectable, UseGuards } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Assignments } from '@prisma/client';
import { UpdateAssignmentDto } from '../dto/update-assignment.dto';

@Injectable()
export class AssignmentsRepository extends AbstractRepository<Assignments> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'Assignments'; // Specify the Prisma model name for entity
  }

  async find(): Promise<Assignments> {
    return this.prisma[this.modelName].findMany({
      where: { status: 1 },
      include: { idividual_submissions: { where: { status: { in: [1, 2] } } } },
      orderBy: [
        {
          id: 'asc',
        },
      ],
    });
  }

  async assignment(id: number): Promise<Assignments> {
    return this.prisma[this.modelName].findFirst({
      where: { id, status: 1 },
      orderBy: [
        {
          id: 'asc',
        },
      ],
    });
  }

  async insert(data: Partial<Assignments>): Promise<Assignments> {
    return this.prisma[this.modelName].create({ data });
  }

  async updateAssignment(id: number, data: UpdateAssignmentDto): Promise<Assignments> {
    const assignment = await this.findById(id);

    if (!assignment) {
      throw new BadRequestException('assignment does not exist.');
    }

    return this.prisma[this.modelName].update({
      where: { id: id },
      data: data,
    });
  }
}
