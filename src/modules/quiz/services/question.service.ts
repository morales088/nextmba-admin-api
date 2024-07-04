import { Injectable } from '@nestjs/common';
import { QuestionRepository } from '../repositories/question.repository';

@Injectable()
export class QuestionService {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async getQuestion(id: number) {
    return this.questionRepository.findById(id);
  }

  async getQuestions() {
    return this.questionRepository.find();
  }

  async createQuestion(data) {
    return this.questionRepository.insert(data);
  }

  async updateQuestion(id: number, data) {
    return this.questionRepository.updateQuestion(id, data);
  }
}
