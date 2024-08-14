import MailerLite, {
  CreateOrUpdateSubscriberParams,
  ListAllGroupsResponse,
  ListSubscribersResponse,
  SingleGroupResponse,
  SubscriberObject,
} from '@mailerlite/mailerlite-nodejs';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { extractCourseName } from '../helpers/extract.helper';
import { snakeCase, startCase, toLower } from 'lodash';
import { SubscriberGroupsService } from '../../modules/subscriber_groups/services/subscriber-groups.service';
import { CreateSubscriberGroup } from 'src/modules/subscriber_groups/dto/subscriber-groups.dto';

@Injectable()
export class MailerLiteService {
  private readonly apiKey: string;
  private readonly mailerLite: MailerLite;

  private readonly logger = new Logger(MailerLiteService.name);

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

  async getGroupByCourseId(courseId: number) {
    return this.subscriberGroupsService.getSubscriberGroupByCourseId(courseId)
  }

  async getAllSubscriberLists() {
    return this.subscriberGroupsService.getAllSubscriberGroups();
  }

  async createOrUpdateSubscriber(studentData: CreateOrUpdateSubscriberParams): Promise<SubscriberObject> {
    return this.mailerLite.subscribers
      .createOrUpdate(studentData)
      .then((response) => {
        const { data } = response.data;
        return data;
      })
      .catch((error) => {
        this.logger.error(`An error occurred: ${error.message}`);
        return null;
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
        this.logger.error(`An error occurred: ${error.message}`);
        return null;
      });
  }

  async assignSubscriberToGroup(subscriberId: string, groupId: string): Promise<SingleGroupResponse> {
    return this.mailerLite.groups
      .assignSubscriber(subscriberId, groupId)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        this.logger.error(`An error occurred: ${error.message}`);
        return null;
      });
  }

  async unAssignSubscriberToGroup(subscriberId: string, groupId: string): Promise<AxiosResponse<null>> {
    return this.mailerLite.groups
      .unAssignSubscriber(subscriberId, groupId)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        this.logger.error(`An error occurred: ${error.message}`);
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
    try {
      const extractedCourseName = extractCourseName(courseName);
      const subscriberGroupName = startCase(`${extractedCourseName} Students`);

      const createdGroup = await this.mailerLite.groups.create({ name: subscriberGroupName });
      const { data } = createdGroup.data;

      const startDateName = snakeCase(toLower(`${extractedCourseName}_${courseId}_start_date`));
      const newField = await this.createNewField(startDateName, 'date');

      await this.subscriberGroupsService.createSubscriberGroup({
        course_id: courseId,
        group_id: data.id,
        group_name: data.name,
        start_date_field: newField.name,
      } as CreateSubscriberGroup);

      return data;
    } catch (error) {
      this.logger.error(`An error occurred while creating a new subscriber group: ${error.message}`);
    }
  }
}
