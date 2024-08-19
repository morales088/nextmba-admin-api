import { Injectable } from '@nestjs/common';
import { TakeAnswerRepository } from '../repositories/take_answer.repository';

@Injectable()
export class TakeAnswerService {
  constructor(private readonly takeAnswerRepository: TakeAnswerRepository) {}

  async getTakeAnswer(id: number) {
    return this.takeAnswerRepository.findById(id);
  }

  async getTakeAsnwers() {
    return this.takeAnswerRepository.find();
  }

  async createTakeAnswers(data) {
    return this.takeAnswerRepository.insert(data);
  }
}
