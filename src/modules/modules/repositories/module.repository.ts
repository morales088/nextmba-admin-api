import { BadRequestException, Injectable } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Modules } from '@prisma/client';
import { UpdateModuleDto } from '../dto/update-module.dto';

@Injectable()
export class ModuleRepository extends AbstractRepository<Modules> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'Modules'; // Specify the Prisma model name for entity
  }

  async find(): Promise<Modules> {
    return this.prisma[this.modelName].findMany({
      where: { status: { notIn: [0] } },
      orderBy: [
        {
          start_date: 'desc',
        },
      ],
    });
  }

  async modules(filterData, pageNumber: number = 1, perPage: number = 10): Promise<Modules> {
    const skipAmount = (pageNumber - 1) * perPage;
    const searchData = filterData.search ?? '';

    let whereCondition = {
      status: {},
      // search name on module
      OR: [
        {
          name: {
            contains: searchData,
            mode: 'insensitive',
          },
        },
      ],
      course: {  },
    };

    if (filterData.status) whereCondition.status = { in: [filterData.status] };
    if (filterData.course) whereCondition.course = { id: filterData.course };

    return this.prisma[this.modelName].findMany({
      where: whereCondition,
      orderBy: [
        {
          start_date: 'desc',
        },
      ],
      include: { course: true },
      skip: skipAmount,
      take: perPage,
    });
  }

  async insert(data: Partial<Modules>): Promise<Modules> {
    const course = await this.prisma.courses.findUnique({ where: { id: data.course_id } });

    if (!course) {
      throw new BadRequestException('Course does not exist.');
    }

    return this.prisma[this.modelName].create({ data });
  }

  async updateModule(id: number, data: UpdateModuleDto): Promise<Modules> {
    const module = await this.findById(id);
    if (!module) {
      throw new BadRequestException('Module does not exist.');
    }

    return this.prisma[this.modelName].update({
      where: { id: id },
      data: data,
    });
  }
}
