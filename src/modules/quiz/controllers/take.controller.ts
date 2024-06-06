import { Controller, UseGuards, Get, Param, Post, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { QuizService } from '../services/quiz.service';
import { TakeService } from '../services/take.service';

@Controller('take')
@UseGuards(AuthGuard('jwt'))
export class TakeController {
  constructor(
    private readonly takeService: TakeService,
    private readonly quizService: QuizService
  ) {}

  @Get('/')
  async getTakes() {
    return await this.takeService.getTakes();
  }

  @Get('/:takeId')
  async getTake(@Param('takeId') takeId: number) {
    return await this.takeService.getTake(takeId);
  }

  @Get('quiz/:quizId')
  async getPerQuiz(@Param('quizId') quizId: number) {
    return await this.takeService.getTakePerQuiz(quizId);
  }
}
