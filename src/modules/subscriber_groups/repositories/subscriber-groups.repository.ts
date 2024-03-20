import { Injectable } from '@nestjs/common';
import { Subscriber_groups } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';

@Injectable()
export class SubscriberGroupsRepository extends AbstractRepository<Subscriber_groups> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'Subscriber_groups';
  }

  async findGroupByCourseId(courseId: number): Promise<Subscriber_groups> {
    return this.prisma[this.modelName].findFirst({
      where: { course_id: courseId, status: 1 },
      include: { course: true },
    });
  }

  async findAllSubscriberGroups(): Promise<Subscriber_groups[] | any> {
    return this.prisma[this.modelName].findMany({
      where: { status: 1 },
      include: { course: true },
    });
  }

  async insert(data: Partial<Subscriber_groups>): Promise<Subscriber_groups> {
    return this.prisma[this.modelName].create({ data });
  }
}
