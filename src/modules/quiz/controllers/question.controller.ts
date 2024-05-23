import { Controller, UseGuards, Get, Param, Post, Body, Put, Request} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { QuestionService } from '../services/question.service';
import { CreateQuestionDto } from '../dto/create-question.dto';
import { UpdateQuestionDto } from '../dto/update-question.dto';

@Controller('question')
@UseGuards(AuthGuard('jwt'))
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get('/')
  async getQuestions() {
    return await this.questionService.getQuestions();
  }

  @Get('/:questionId')
  async getQuestion(@Param('questionId') questionId: number) {
    return await this.questionService.getQuestion(questionId);
  }

  @Post('/')
  async createQuestion(@Body() createQuestionDto: CreateQuestionDto) {
    const questionData = {
      ...createQuestionDto,
    };

    return await this.questionService.createQuestion(questionData);
  }

  @Put('/:questionId')
  async updateQuestion(
    @Param('questionId') questionId: number,
    @Request() req: any,
    @Body() updateQuestionDto: UpdateQuestionDto
  ) {
    const questionData = {
      ...updateQuestionDto,
    };
    return await this.questionService.updateQuestion(questionId, questionData);
  }
}
