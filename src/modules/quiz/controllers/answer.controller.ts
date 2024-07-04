import { Controller, UseGuards, Get, Param, Post, Body, Put, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AnswerService } from '../services/answer.service';
import { CreateAnswerDto } from '../dto/create-answer.dto';
import { UpdateAnswerDto } from '../dto/update-answer.dto';

@Controller('answer')
@UseGuards(AuthGuard('jwt'))
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}

  @Get('/')
  async getAnswers() {
    return await this.answerService.getAnswers();
  }

  @Get('/:asnwerId')
  async getAnswer(@Param('asnwerId') asnwerId: number) {
    return await this.answerService.getAnswer(asnwerId);
  }

  @Post('/')
  async createAnswer(@Body() createAnswerDto: CreateAnswerDto) {
    const answerData = {
      ...createAnswerDto,
    };

    return await this.answerService.createAnswer(answerData);
  }

  @Put('/:questionId')
  async updateQuestion(
    @Param('questionId') questionId: number,
    @Request() req: any,
    @Body() updateAnswerDto: UpdateAnswerDto
  ) {
    const answerData = {
      ...updateAnswerDto,
    };
    return await this.answerService.updateAnswer(questionId, answerData);
  }
}
