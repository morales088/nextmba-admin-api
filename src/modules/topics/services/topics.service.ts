import { Injectable } from '@nestjs/common';
import { TopicsRepository } from '../repositories/topics.repositories';

@Injectable()
export class TopicsService {
    constructor(
        private readonly topicsRepository: TopicsRepository
      ) {}

      async getTopics() {
        return this.topicsRepository.find();
      }
  
      async createTopic(data){
          return this.topicsRepository.insert(data);
      }
  
      async updateTopic(id: number, data) {
        return this.topicsRepository.updateTopic(id, data);
      }
}
