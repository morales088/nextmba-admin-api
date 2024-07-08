import { BadRequestException, Injectable, UseGuards } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Quiz } from '@prisma/client';
import { UpdateQuizDto } from '../dto/update-quiz.dto ';

@Injectable()
export class QuizRepository extends AbstractRepository<Quiz> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'Quiz'; // Specify the Prisma model name for entity
  }

  async findById(id: number): Promise<Quiz> {
    return this.prisma.quiz.findFirst({
      include: {
        // quiz_questions : { where: { status: 1 } }
      },
      where: { id },
    });
  }

  async find(): Promise<Quiz[]> {
    return this.prisma.quiz.findMany({
      where: { status: 1 },
      orderBy: [
        {
          id: 'asc',
        },
      ],
    });
  }

  async insert(data: Partial<Quiz>): Promise<Quiz> {
    return this.prisma[this.modelName].create({ data });
  }

  async updateQuiz(id: number, data: UpdateQuizDto): Promise<Quiz> {
    const quiz = await this.findById(id);

    if (!quiz) {
      throw new BadRequestException('quiz does not exist.');
    }

    return this.prisma[this.modelName].update({
      where: { id: id },
      data: data,
    });
  }
}
