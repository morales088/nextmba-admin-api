import { Injectable } from '@nestjs/common';
import { QuizQuestionRepository } from '../repositories/quiz_question.repository';

@Injectable()
export class QuizQuestionService {
  constructor(private readonly quizQuestionRepository: QuizQuestionRepository) {}

  async getQuizQuestion(id: number) {
    return this.quizQuestionRepository.findById(id);
  }

  async getQuizQuestions() {
    return this.quizQuestionRepository.find();
  }

  async createQuizQuestions(data) {
    return this.quizQuestionRepository.insert(data);
  }
}
