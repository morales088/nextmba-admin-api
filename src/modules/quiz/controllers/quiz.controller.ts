import { Controller, UseGuards, Get, Param, Post, Body, Put, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { QuestionService } from '../services/question.service';
import { CreateQuestionDto } from '../dto/create-question.dto';
import { QuizService } from '../services/quiz.service';
import { CreateQuizDto } from '../dto/create-quiz.dto';
import { UpdateQuizDto } from '../dto/update-quiz.dto ';

@Controller('quiz')
@UseGuards(AuthGuard('jwt'))
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get('/')
  async getAllQuiz() {
    return await this.quizService.getAllQuiz();
  }

  @Get('/:quizId')
  async getQuiz(@Param('quizId') quizId: number) {
    return await this.quizService.getQuiz(quizId);
  }

  @Post('/')
  async createQuiz(@Body() createQuizDto: CreateQuizDto) {
    const quizData = {
      ...createQuizDto,
    };

    return await this.quizService.createQuiz(quizData);
  }

  @Put('/:quizId')
  async updateQuestion(
    @Param('quizId') quizId: number,
    @Request() req: any,
    @Body() updateQuizDto: UpdateQuizDto
  ) {
    const quizData = {
      ...updateQuizDto,
    };
    return await this.quizService.updateQuiz(quizId, quizData);
  }
}
