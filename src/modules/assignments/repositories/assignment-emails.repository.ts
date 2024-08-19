import { BadRequestException, Injectable, UseGuards } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Assignments, Assignment_emails } from '@prisma/client';
import { UpdateAssignmentDto } from '../dto/update-assignment.dto';
import { UpdateAssignmentEmailDto } from '../dto/update-assignmentEmail.dto';

@Injectable()
export class AssignmentEmailsRepository extends AbstractRepository<Assignment_emails> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'Assignment_emails'; // Specify the Prisma model name for entity
  }

  async findById(id: number): Promise<Assignment_emails> {
    return this.prisma[this.modelName].findFirst({
      include: {
        
      },
      where: { id },
    });
  }

  async find(pageNumber : number, perPage : number): Promise<Assignment_emails[]> {
    const skipAmount = (pageNumber - 1) * perPage;

    return this.prisma[this.modelName].findMany({
      where: { status: 1 },
      include: {
      },
      orderBy: [
        {
          id: 'desc',
        },
      ],
      skip: skipAmount,
      take: perPage,
    });
  }

  async insert(data: Partial<Assignment_emails>): Promise<Assignment_emails> {
    return this.prisma[this.modelName].create({ data });
  }

  async updateAssignment(id: number, data: UpdateAssignmentEmailDto): Promise<Assignment_emails> {
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
