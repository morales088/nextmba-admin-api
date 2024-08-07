import { Module } from '@nestjs/common';
import { QuizController } from './controllers/quiz.controller';
import { QuizService } from './services/quiz.service';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { QuestionService } from './services/question.service';
import { AnswerService } from './services/answer.service';
// import { QuizQuestionService } from './services/quiz_question.service';
import { TakeService } from './services/take.service';
import { TakeAnswerService } from './services/take_answer.service';
import { AnswerRepository } from './repositories/answer.repository';
import { QuestionRepository } from './repositories/question.repository';
// import { QuizQuestionRepository } from './repositories/quiz_question.repository';
import { QuizRepository } from './repositories/quiz.repository';
import { TakeRepository } from './repositories/take.repository';
import { TakeAnswerRepository } from './repositories/take_answer.repository';
import { QuestionController } from './controllers/question.controller';
import { AnswerController } from './controllers/answer.controller';
import { TakeController } from './controllers/take.controller';

@Module({
  imports: [PrismaModule],
  controllers: [QuizController, QuestionController, AnswerController, TakeController],
  providers: [
    QuizService, 
    QuestionService, 
    AnswerService, 
    // QuizQuestionService, 
    TakeService, 
    TakeAnswerService,
    AnswerRepository,
    QuestionRepository,
    // QuizQuestionRepository,
    QuizRepository,
    TakeRepository,
    TakeAnswerRepository
  ],
})
export class QuizModule {}
