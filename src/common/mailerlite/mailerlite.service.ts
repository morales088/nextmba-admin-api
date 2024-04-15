import MailerLite, {
  CreateOrUpdateSubscriberParams,
  ListAllGroupsResponse,
  ListSubscribersResponse,
  SingleGroupResponse,
  SubscriberObject,
} from '@mailerlite/mailerlite-nodejs';
import { BadRequestException, Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { extractCourseName } from '../helpers/extract.helper';
import { snakeCase, startCase, toLower } from 'lodash';
import { SubscriberGroupsService } from '../../modules/subscriber_groups/services/subscriber-groups.service';
import { CreateSubscriberGroup } from 'src/modules/subscriber_groups/dto/subscriber-groups.dto';

@Injectable()
export class MailerLiteService {
  private readonly apiKey: string;
  private readonly mailerLite: MailerLite;

  constructor(private readonly subscriberGroupsService: SubscriberGroupsService) {
    this.apiKey = process.env.MAILERLITE_API_KEY;
    this.mailerLite = new MailerLite({ api_key: this.apiKey });
  }

  async getAllSubscribers(): Promise<ListSubscribersResponse | any> {
    return this.mailerLite.subscribers
      .get({ filter: { status: 'active' } })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        throw new BadRequestException(error);
      });
  }

  async getAllSubscriberGroups(): Promise<ListAllGroupsResponse> {
    return this.mailerLite.groups
      .get({
        limit: 50,
        page: 1,
        sort: '-name',
      })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        throw new BadRequestException(error);
      });
  }

  async createOrUpdateSubscriber(studentData: CreateOrUpdateSubscriberParams): Promise<SubscriberObject> {
    return this.mailerLite.subscribers
      .createOrUpdate(studentData)
      .then((response) => {
        const { data } = response.data;
        return data;
      })
      .catch((error) => {
        console.log("💡 ~ error:", error.message)
        // throw new BadRequestException(error);
        return null
      });
  }

  async assignSubscriberToGroups(studentData: CreateOrUpdateSubscriberParams): Promise<SubscriberObject> {
    return this.mailerLite.subscribers
      .createOrUpdate(studentData)
      .then((response) => {
        const { data } = response.data;
        return data;
      })
      .catch((error) => {
        throw new BadRequestException(error);
      });
  }

  async assignSubscriberToGroup(subscriberId: string, groupId: string): Promise<SingleGroupResponse> {
    return this.mailerLite.groups
      .assignSubscriber(subscriberId, groupId)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        throw new BadRequestException(error);
      });
  }

  async unAssignSubscriberToGroup(subscriberId: string, groupId: string): Promise<AxiosResponse<null>> {
    return this.mailerLite.groups
      .unAssignSubscriber(subscriberId, groupId)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        return null;
      });
  }

  async removeSubscriber(subscriberId: string): Promise<AxiosResponse<null>> {
    return this.mailerLite.subscribers.delete(subscriberId);
  }

  async createNewField(name: string, type: 'text' | 'number' | 'date') {
    return this.mailerLite.fields
      .create({
        name,
        type,
      })
      .then((response) => {
        const { data } = response.data;
        return data;
      })
      .catch((error) => {
        throw new BadRequestException(error);
      });
  }

  async createNewSubscriberGroup(courseId: number, courseName: string) {
    const extractedCourseName = extractCourseName(courseName);
    const subscriberGroupName = startCase(`${extractedCourseName} Students`);

    const createdGroup = await this.mailerLite.groups
      .create({ name: subscriberGroupName })
      .then((response) => {
        const { data } = response.data;
        return data;
      })
      .catch((error) => {
        throw new BadRequestException(error);
      });

    const startDateName = snakeCase(toLower(`${extractedCourseName}_${courseId}_start_date`));
    const newField = await this.createNewField(startDateName, 'date');

    await this.subscriberGroupsService.createSubscriberGroup({
      course_id: courseId,
      group_id: createdGroup.id,
      group_name: createdGroup.name,
      start_date_field: newField.name,
    } as CreateSubscriberGroup);

    return createdGroup;
  }
}
