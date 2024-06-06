import { Injectable } from '@nestjs/common';
import { TakeRepository } from '../repositories/take.repository';

@Injectable()
export class TakeService {
  constructor(private readonly takeRepository: TakeRepository) {}

  async getTake(id: number) {
    return this.takeRepository.findById(id);
  }

  async getTakes() {
    return this.takeRepository.find();
  }

  async createTake(data) {
    return this.takeRepository.insert(data);
  }

  async getTakePerQuiz(quizId: number) {
    return this.takeRepository.findByQuiz(quizId);
  }
}
