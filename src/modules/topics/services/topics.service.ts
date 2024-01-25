import { Injectable } from '@nestjs/common';
import { TopicsRepository } from '../repositories/topics.repository';

@Injectable()
export class TopicsService {
  constructor(private readonly topicsRepository: TopicsRepository) {}

  async getTopic(id: number) {
    return this.topicsRepository.findById(id);
  }

  async getByModuleId(id: number) {
    return this.topicsRepository.findByModuleId(id);
  }

  async getTopics() {
    return this.topicsRepository.find();
  }

  async createTopic(data) {
    return this.topicsRepository.insert(data);
  }

  async updateTopic(id: number, data) {
    const topicData = {
      ...data,
    };

    if (data.featured_lecture === true && data.library_position <= 0) {
      const topic = await this.topicsRepository.findById(id);
      const libraryPosition = await this.topicsRepository.libraryPosition(topic.module_id);
      const result = libraryPosition as unknown as { _max: { library_position: number } };
      const highestPosition = result._max.library_position + 1

      topicData.library_position = highestPosition
    }

    return this.topicsRepository.updateTopic(id, topicData);
  }
}
