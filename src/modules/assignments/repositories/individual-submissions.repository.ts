import { BadRequestException, Injectable, UseGuards } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {  Individual_submissions } from '@prisma/client';
import { UpdateIndividualSubmissionDto } from '../dto/update-individual-submission.dto';

@Injectable()
export class IndividualSubmmisionsRepository extends AbstractRepository<Individual_submissions> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'Individual_submissions'; // Specify the Prisma model name for entity
  }

  async find(search: string, assignmentId: number, status: number): Promise<Individual_submissions> {
    interface WhereCondition {
      status?: any;
      assignment_id?: number;
      OR?: any;
    }

    let whereCondition: WhereCondition = {  };

    if (status) whereCondition.status = status;
    if (assignmentId) whereCondition.assignment_id = assignmentId;
    if (search)
      whereCondition.OR = [
        {
          student: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          assignment: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
      ];
      
    return this.prisma[this.modelName].findMany({
      where: whereCondition,
      include: { student: true, assignment: { include: { course: true, module: true } } },
      orderBy: [
        {
          id: 'asc',
        },
      ],
    });
  }

  async submission(id: number): Promise<Individual_submissions> {
    return this.prisma[this.modelName].findFirst({
      where: { id },
      include: { student: true, assignment: { include: { course: true, module: true } } },
      orderBy: [
        {
          id: 'asc',
        },
      ],
    });
  }

  // async insert(data: Partial<Idividual_submissions>): Promise<Individual_submissions> {
  //   return this.prisma[this.modelName].create({ data });
  // }

  async updateSubmission(id: number, data: UpdateIndividualSubmissionDto): Promise<Individual_submissions> {
    const submission = await this.findById(id);

    if (!submission) {
      throw new BadRequestException('submission does not exist.');
    }

    return this.prisma[this.modelName].update({
      where: { id: id },
      data: data,
    });
  }
}
