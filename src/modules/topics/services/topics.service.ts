import { Injectable } from '@nestjs/common';
import { TopicsRepository } from '../repositories/topics.repository';

@Injectable()
export class TopicsService {
    constructor(
        private readonly topicsRepository: TopicsRepository
      ) {}

      async getTopic(id:number) {
        return this.topicsRepository.findById(id);
      }

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
