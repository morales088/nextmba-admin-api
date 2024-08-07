import { BadRequestException, Injectable, UseGuards } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Questions } from '@prisma/client';
import { UpdateQuestionDto } from '../dto/update-question.dto';

@Injectable()
export class QuestionRepository extends AbstractRepository<Questions> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'Questions'; // Specify the Prisma model name for entity
  }

  async findById(id: number): Promise<Questions> {
    return this.prisma[this.modelName].findFirst({
      include: {
        // quiz_questions : { where: { status: 1 } }
      },
      where: { id },
    });
  }

  async findByQuizId(quizId: number): Promise<Questions[]> {
    return this.prisma[this.modelName].findMany({
      where: { status: 1, quiz_id: quizId },
      include: { answers: { where: { active: 1, status: 1 } } },
      orderBy: [
        {
          id: 'asc',
        },
      ],
    });
  }

  async find(): Promise<Questions[]> {
    return this.prisma[this.modelName].findMany({
      where: { status: 1 },
      orderBy: [
        {
          id: 'asc',
        },
      ],
    });
  }

  async insert(data: Partial<Questions>): Promise<Questions> {
    return this.prisma[this.modelName].create({ data });
  }

  async updateQuestion(id: number, data: UpdateQuestionDto): Promise<Questions> {
    const question = await this.findById(id);

    if (!question) {
      throw new BadRequestException('question does not exist.');
    }

    return this.prisma[this.modelName].update({
      where: { id: id },
      data: data,
    });
  }
}
