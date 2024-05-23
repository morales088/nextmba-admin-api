import { Injectable } from '@nestjs/common';
import { QuizRepository } from '../repositories/quiz.repository';

@Injectable()
export class QuizService {
  constructor(private readonly quizRepository: QuizRepository) {}

  async getQuiz(id: number) {
    return this.quizRepository.findById(id);
  }

  async getAllQuiz() {
    return this.quizRepository.find();
  }

  async createQuiz(data) {
    return this.quizRepository.insert(data);
  }
}
