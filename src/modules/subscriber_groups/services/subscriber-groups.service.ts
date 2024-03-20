import { Injectable } from '@nestjs/common';
import { SubscriberGroupsRepository } from '../repositories/subscriber-groups.repository';
import { CreateSubscriberGroup } from '../dto/subscriber-groups.dto';

@Injectable()
export class SubscriberGroupsService {
  constructor(private readonly subscriberGroupRepository: SubscriberGroupsRepository) {}

  async getSubscriberGroupByCourseId(courseId: number) {
    return this.subscriberGroupRepository.findGroupByCourseId(courseId);
  }

  async getAllSubscriberGroups() {
    const allSubscriberGroups = await this.subscriberGroupRepository.findAllSubscriberGroups();

    const courseStartingDates = allSubscriberGroups
      .filter((group) => group.course_id !== 0)
      .reduce((dates, group) => {
        dates[group.start_date_field] = group.course.starting_date;
        return dates;
      }, {});

    const subscriberGroups = allSubscriberGroups.map((group) => group.group_id);

    return { courseStartingDates, allSubscriberGroups: subscriberGroups };
  }

  async createSubscriberGroup(subscriberGroupData: CreateSubscriberGroup) {
    return this.subscriberGroupRepository.insert(subscriberGroupData);
  }
}
