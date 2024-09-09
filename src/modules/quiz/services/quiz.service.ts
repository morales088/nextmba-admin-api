import { Injectable } from '@nestjs/common';
import { QuizRepository } from '../repositories/quiz.repository';
import { QuestionRepository } from '../repositories/question.repository';
import { CreateQuizDto } from '../dto/create-quiz.dto';
import { TakeRepository } from '../repositories/take.repository';
// import { QuizQuestionRepository } from '../repositories/quiz_question.repository';

@Injectable()
export class QuizService {
  constructor(
    private readonly quizRepository: QuizRepository,
    private readonly questionRepository: QuestionRepository,
    private readonly takeRepository: TakeRepository
  ) {}

  async getQuiz(id: number) {
    return this.quizRepository.findById(id);
  }

  async getAllQuiz() {
    return this.quizRepository.find();
  }

  async getByQuizId(quizId: number) {
    return this.questionRepository.findByQuizId(quizId);
  }

  async createQuiz(data: CreateQuizDto) {
    // try {
      
    // //create quiz
    // const {question_qty, ...newData } = data // removing question_qty to object
    // const quiz = await this.quizRepository.insert(newData);

    // //create quiz questions
    // const questions = await this.randomQuestions(data.question_qty, data.module_id);
    // for (const data of questions) {
    //   const quizQuestionData = {
    //     quiz_id: quiz.id,
    //     question_id: data.id,
    //   };
    //   await this.quizQuestionRepository.create(quizQuestionData);
    // }

    // return this.getQuiz(quiz.id);
    // } catch (error) {
    //   throw new Error(error);
    // }
    try {
      return await this.quizRepository.insert(data);
    } catch (error) {
      throw new Error(error);
    }
  }

  // async randomQuestions(limit: number, moduleId: number) {
  //   const allQuestions = await this.questionRepository.findByModuleId(moduleId);
  //   const shuffled = allQuestions.sort(() => 0.5 - Math.random());
  //   return shuffled.slice(0, limit);
  // }

  async updateQuiz(id: number, data) {
    return this.quizRepository.updateQuiz(id, data);
  }

  async submissionsPerQuiz(quizId: number) {
    const takes = await this.takeRepository.submissionsPerQuiz(quizId);
    console.log(takes)
    return takes
  }
}
