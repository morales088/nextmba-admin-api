import MailerLite, {
  CreateOrUpdateSubscriberParams,
  ListAllGroupsResponse,
  ListSubscribersResponse,
  SingleGroupResponse,
  SubscriberObject,
} from '@mailerlite/mailerlite-nodejs';
import { BadRequestException, Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';

@Injectable()
export class MailerLiteService {
  private readonly apiKey: string;
  private readonly mailerLite: MailerLite;

  constructor() {
    this.apiKey = process.env.MAILERLITE_API_KEY;
    this.mailerLite = new MailerLite({ api_key: this.apiKey });
  }

  async getAllSubscribers(): Promise<ListSubscribersResponse | any> {
    return this.mailerLite.subscribers.get({ filter: { status: 'active' } });
  }

  async getAllSubscriberGroups(): Promise<ListAllGroupsResponse> {
    return this.mailerLite.groups
      .get({
        limit: 25,
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

  async addNewSubscriber(studentData: CreateOrUpdateSubscriberParams): Promise<SubscriberObject> {
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
        console.log("💡 ~ response.data:", response.data)
        return response.data;
      })
      .catch((error) => {
        throw new BadRequestException(error);
      });
  }

  async removeSubscriber(subscriberId: string): Promise<AxiosResponse<null>> {
    return this.mailerLite.subscribers.delete(subscriberId);
  }
}
