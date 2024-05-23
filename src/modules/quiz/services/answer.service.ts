import { Injectable } from '@nestjs/common';
import { AnswerRepository } from '../repositories/answer.repository';

@Injectable()
export class AnswerService {
  constructor(private readonly answerRepository: AnswerRepository) {}

  async getAnswer(id: number) {
    return this.answerRepository.findById(id);
  }

  async getAnswers() {
    return this.answerRepository.find();
  }

  async createAnswer(data) {
    return this.answerRepository.insert(data);
  }

  async updateAnswer(id: number, data) {
    return this.answerRepository.updateAnswer(id, data);
  }
}
