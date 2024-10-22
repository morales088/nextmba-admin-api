import { Injectable } from '@nestjs/common';
import { Subscriber_groups, Prisma } from '@prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class SubscriberGroupsRepository {
  constructor(protected readonly db: PrismaService) {}

  async findGroupByCourseId(courseId: number): Promise<Subscriber_groups> {
    return this.db.subscriber_groups.findFirst({
      where: { course_id: courseId, status: 1 },
      include: { course: true },
    });
  }

  async findAllSubscriberGroups(): Promise<Subscriber_groups[] | any> {
    return this.db.subscriber_groups.findMany({
      where: { status: 1 },
      include: { course: true },
    });
  }

  async insert(data: Prisma.Subscriber_groupsUncheckedCreateInput): Promise<Subscriber_groups> {
    return this.db.subscriber_groups.create({ data });
  }
}
