import { BadRequestException, Injectable } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Modules } from '@prisma/client';
import { UpdateModuleDto } from '../dto/update-module.dto';
import { currentTime } from 'src/common/helpers/date.helper';
import { ModuleType } from 'src/common/constants/enum';

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
      course: {},
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

  async previousModules(userId, courseId) {
    const results: Modules[] = await this.prisma.$queryRaw`SELECT distinct m.*
                                                          FROM "Modules" as m
                                                          LEFT JOIN "Courses" as C ON m.course_id = c.id and c.id = ${courseId}
                                                          LEFT JOIN "Student_courses" as sc ON sc.course_id = c.id and sc.student_id = ${userId}
                                                          WHERE m.status in (4,5) AND c.is_displayed = 1 AND c.status <> 0 AND sc.status <> 0 AND sc.starting_date <= m.start_date
                                                          ORDER BY m.start_date asc`;

    let modules = results as unknown as {
      id: number;
      name: string;
      description: string;
      start_date: string;
      course_id: number;
      course: object;
      translations: object;
      topics: object[];
      medias: object;
      has_access: boolean;
    }[];

    for (const module of modules) {
      // add topics to module
      const topics = await this.prisma.topics.findMany({
        where: { module_id: module.id, status: 1, hide_recordings: false },
        include: {
          speaker: true,
          files: { where: { status: 1 } },
          medias: { where: { status: 1 } },
        },
      });
      module.topics = topics;
    }

    const filteredModules = modules.filter((res) => res.topics.length > 0);

    return filteredModules;
  }

  async upcomingModules(): Promise<Modules[]> {
    const currentDate = currentTime();
    const { OFFLINE, LIVE } = ModuleType;

    const upcomingModules: Modules[] = await this.prisma.modules.findMany({
      where: {
        // course_id: 1,
        // tier: ModuleTierType.FULL,
        status: { in: [OFFLINE, LIVE] },
        start_date: { gte: currentDate },
      },
      orderBy: { start_date: 'asc' },
    });

    return upcomingModules;
  }
}
