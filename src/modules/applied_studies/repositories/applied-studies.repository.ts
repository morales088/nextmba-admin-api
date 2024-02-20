import { BadRequestException, Injectable, UseGuards } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Applied_studies } from '@prisma/client';

@Injectable()
export class AppliedStudiesRepository extends AbstractRepository<Applied_studies> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'Applied_studies'; // Specify the Prisma model name for entity
  }

  async find(): Promise<Applied_studies> {
    return this.prisma[this.modelName].findFirst({
      include: { course: true },
      orderBy: [
        {
          id: 'asc',
        },
      ],
    });
  }

  async appliedStudy(id: number): Promise<Applied_studies> {
    return this.prisma[this.modelName].findMany({
      where: { id },
      include: { course: true },
      orderBy: [
        {
          id: 'asc',
        },
      ],
    });
  }

  async insert(data: Partial<Applied_studies>): Promise<Applied_studies> {
    const course = await this.prisma.courses.findFirst({ where: { id: data.course_id } });

    if (!course) {
      throw new BadRequestException('Course does not exist.');
    }

    return this.prisma[this.modelName].create({ data });
  }

  async update(id: number, data: Partial<Applied_studies>): Promise<Applied_studies> {
    const study = await this.findById(id);

    if (!study) {
      throw new BadRequestException('Applied study does not exist.');
    }

    //if status 0, remove study id to topic
    if (data.status == 0) {
      await this.prisma.topics.updateMany({
        where: { applied_study_id: id },
        data: { applied_study_id: 0 },
      });
    }

    return this.prisma[this.modelName].update({
      where: { id: id },
      data: data,
    });
  }
}
