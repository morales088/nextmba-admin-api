import { Controller, UseGuards, Get, Param, Post, Body, Put, Request} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { QuestionService } from '../services/question.service';
import { CreateQuestionDto } from '../dto/create-question.dto';
import { UpdateQuestionDto } from '../dto/update-question.dto';
import { AnswerService } from '../services/answer.service';

@Controller('question')
@UseGuards(AuthGuard('jwt'))
export class QuestionController {
  constructor(private readonly questionService: QuestionService,private readonly answerService: AnswerService) {}

  @Get('/')
  async getQuestions() {
    return await this.questionService.getQuestions();
  }

  @Get('/:questionId')
  async getQuestion(@Param('questionId') questionId: number) {
    return await this.questionService.getQuestion(questionId);
  }

  @Get('/:questionId/answers')
  async getAnswerPerQuestion(@Param('questionId') questionId: number) {
    return await this.answerService.findByQuestionId(questionId);
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
